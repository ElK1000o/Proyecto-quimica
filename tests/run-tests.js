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
  const massMass = calculate('mass-mass', {
    soluteMassGrams: '18',
    solutionMassGrams: '150',
    percent: '',
  });
  assert.equal(massMass.primaryResult.value, 12);

  const molarity = calculate('molarity', {
    molarityMolPerL: '',
    massSoluteGrams: '29.22',
    molarMassGramsPerMol: '58.44',
    solutionVolumeLiters: '1',
  });
  assert.equal(molarity.primaryResult.value, 0.5);

  const moleFraction = calculate('mole-fraction', {
    moleFraction: '',
    molesComponent: '2',
    molesOther: '3',
  });
  assert.equal(moleFraction.primaryResult.value, 0.4);

  console.log('OK dominio: calculadoras principales');
}

async function runApiChecks() {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const catalogResponse = await fetch(`${baseUrl}/api/calculators`);
    assert.equal(catalogResponse.status, 200);

    const setCookie = catalogResponse.headers.get('set-cookie');
    assert.ok(setCookie);

    const csrfCookie = parseCookieHeader(setCookie);
    const csrfToken = extractCookieValue(csrfCookie, 'csrf-token');
    assert.ok(csrfToken);

    const calculateResponse = await fetch(`${baseUrl}/api/calculate/mass-mass`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: csrfCookie,
        origin: baseUrl,
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({
        soluteMassGrams: '10',
        solutionMassGrams: '50',
        percent: '',
      }),
    });

    assert.equal(calculateResponse.status, 200);
    const payload = await calculateResponse.json();
    assert.equal(payload.data.primaryResult.value, 20);

    const healthResponse = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthResponse.status, 200);

    console.log('OK API: catalogo, CSRF y healthcheck');
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

async function main() {
  await runDomainChecks();
  await runApiChecks();
  console.log('Todos los smoke tests pasaron.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
