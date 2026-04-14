import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import { createApp } from '../../src/server/app.js';

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

test('expone catalogo y protege calculos con CSRF', async () => {
  const server = http.createServer(createApp());
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const calculatorsResponse = await fetch(`${baseUrl}/api/calculators`);
    assert.equal(calculatorsResponse.status, 200);

    const setCookie = calculatorsResponse.headers.get('set-cookie');
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
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
