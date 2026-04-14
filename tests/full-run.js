import assert from 'node:assert/strict';
import http from 'node:http';

import { createApp } from '../src/server/app.js';
import { calculate } from '../src/server/services/calculationEngine.js';

function parseCookieHeader(rawHeader) {
  return rawHeader.split(';')[0];
}

function extractCookieValue(cookieHeader, name) {
  return cookieHeader
    .split(';')
    .map((fragment) => fragment.trim())
    .find((fragment) => fragment.startsWith(`${name}=`))
    ?.split('=')[1];
}

async function runDomainChecks() {
  assert.equal(
    calculate('mass-mass', { soluteMassGrams: '18', solutionMassGrams: '150', percent: '' }).primaryResult.value,
    12,
  );
  assert.equal(
    calculate('mass-volume', { soluteMassGrams: '5', solutionVolumeMilliliters: '250', percent: '' }).primaryResult.value,
    2,
  );
  assert.equal(
    calculate('volume-volume', { soluteVolumeMilliliters: '25', solutionVolumeMilliliters: '100', percent: '' }).primaryResult.value,
    25,
  );
  assert.equal(
    calculate('ppm', { soluteMassMilligrams: '4', solutionVolumeLiters: '2', ppm: '' }).primaryResult.value,
    2,
  );
  assert.equal(
    calculate('molarity', { molarityMolPerL: '', massSoluteGrams: '29.22', molarMassGramsPerMol: '58.44', solutionVolumeLiters: '1' }).primaryResult.value,
    0.5,
  );
  assert.equal(
    calculate('normality', { normalityEqPerL: '', massSoluteGrams: '49', molarMassGramsPerMol: '98', equivalenceFactor: '2', solutionVolumeLiters: '1' }).primaryResult.value,
    1,
  );
  assert.equal(
    calculate('mole-fraction', { moleFraction: '', molesComponent: '2', molesOther: '3' }).primaryResult.value,
    0.4,
  );

  console.log('OK dominio: siete unidades operativas');
}

async function runApiChecks() {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const catalogResponse = await fetch(`${baseUrl}/api/calculators`);
    assert.equal(catalogResponse.status, 200);
    const catalogPayload = await catalogResponse.json();
    assert.equal(catalogPayload.data.length, 7);

    const setCookie = catalogResponse.headers.get('set-cookie');
    assert.ok(setCookie);

    const csrfCookie = parseCookieHeader(setCookie);
    const csrfToken = extractCookieValue(csrfCookie, 'csrf-token');
    assert.ok(csrfToken);

    const calculationPayloads = [
      {
        id: 'mass-mass',
        body: { soluteMassGrams: '18', solutionMassGrams: '150', percent: '' },
        expected: 12,
      },
      {
        id: 'mass-volume',
        body: { soluteMassGrams: '5', solutionVolumeMilliliters: '250', percent: '' },
        expected: 2,
      },
      {
        id: 'volume-volume',
        body: { soluteVolumeMilliliters: '25', solutionVolumeMilliliters: '100', percent: '' },
        expected: 25,
      },
      {
        id: 'ppm',
        body: { soluteMassMilligrams: '4', solutionVolumeLiters: '2', ppm: '' },
        expected: 2,
      },
      {
        id: 'molarity',
        body: {
          molarityMolPerL: '',
          massSoluteGrams: '29.22',
          molarMassGramsPerMol: '58.44',
          solutionVolumeLiters: '1',
        },
        expected: 0.5,
      },
      {
        id: 'normality',
        body: {
          normalityEqPerL: '',
          massSoluteGrams: '49',
          molarMassGramsPerMol: '98',
          equivalenceFactor: '2',
          solutionVolumeLiters: '1',
        },
        expected: 1,
      },
      {
        id: 'mole-fraction',
        body: { moleFraction: '', molesComponent: '2', molesOther: '3' },
        expected: 0.4,
      },
    ];

    for (const calculation of calculationPayloads) {
      const calculateResponse = await fetch(`${baseUrl}/api/calculate/${calculation.id}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          cookie: csrfCookie,
          origin: baseUrl,
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(calculation.body),
      });
      assert.equal(calculateResponse.status, 200);
      const calculatePayload = await calculateResponse.json();
      assert.equal(calculatePayload.data.primaryResult.value, calculation.expected);
    }

    const converterCatalogResponse = await fetch(`${baseUrl}/api/converter`);
    assert.equal(converterCatalogResponse.status, 200);
    const converterCatalogPayload = await converterCatalogResponse.json();
    assert.ok(converterCatalogPayload.data.mass);
    assert.ok(converterCatalogPayload.data.volume);

    const convertResponse = await fetch(`${baseUrl}/api/convert?category=mass&fromUnit=mg&toUnit=g&value=1500`);
    assert.equal(convertResponse.status, 200);
    const convertPayload = await convertResponse.json();
    assert.equal(convertPayload.data.outputValue, 1.5);

    const exercisesResponse = await fetch(`${baseUrl}/api/exercises?unit=normality`);
    assert.equal(exercisesResponse.status, 200);
    const exercisesPayload = await exercisesResponse.json();
    assert.ok(exercisesPayload.data.every((exercise) => exercise.unit === 'normality'));

    const generatedResponse = await fetch(`${baseUrl}/api/generated-exercise?unit=ppm&difficulty=basico`);
    assert.equal(generatedResponse.status, 200);
    const generatedPayload = await generatedResponse.json();
    assert.equal(generatedPayload.data.unit, 'ppm');

    const errorsResponse = await fetch(`${baseUrl}/api/common-errors`);
    assert.equal(errorsResponse.status, 200);
    const errorsPayload = await errorsResponse.json();
    assert.ok(errorsPayload.data.length >= 5);

    const healthResponse = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthResponse.status, 200);

    console.log('OK API: catalogo, calculo, conversion, ejercicios y generacion');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

async function main() {
  await runDomainChecks();
  await runApiChecks();
  console.log('Todos los smoke tests completos pasaron.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
