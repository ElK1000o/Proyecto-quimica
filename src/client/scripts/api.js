function readCookie(name) {
  return document.cookie
    .split(';')
    .map((fragment) => fragment.trim())
    .find((fragment) => fragment.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function requestJson(url, options = {}) {
  const headers = new Headers(options.headers ?? {});
  const method = options.method ?? 'GET';

  if (method !== 'GET') {
    headers.set('content-type', 'application/json');
    const csrfToken = readCookie('csrf-token');
    if (csrfToken) {
      headers.set('x-csrf-token', decodeURIComponent(csrfToken));
    }
  }

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: 'same-origin',
  });

  const payload = await response.json().catch(() => ({ ok: false, error: { message: 'Respuesta invalida del servidor.' } }));
  if (!response.ok || !payload.ok) {
    throw new Error(payload?.error?.message ?? 'No fue posible completar la solicitud.');
  }

  return payload.data;
}

export function fetchCalculators() {
  return requestJson('/api/calculators');
}

export function fetchExercises(unit = 'all') {
  return requestJson(`/api/exercises?unit=${encodeURIComponent(unit)}`);
}

export function calculate(calculatorId, values) {
  return requestJson(`/api/calculate/${calculatorId}`, {
    method: 'POST',
    body: JSON.stringify(values),
  });
}
