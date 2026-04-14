function readCookie(name) {
  return document.cookie
    .split(';')
    .map((fragment) => fragment.trim())
    .find((fragment) => fragment.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function buildFriendlyMessage(response, payload) {
  const message = payload?.error?.message;

  if (response.status === 404) {
    return 'La sección solicitada no está disponible en este momento. Recarga la página y vuelve a intentarlo.';
  }

  if (response.status >= 500) {
    return 'Ocurrió un problema al procesar la solicitud. Vuelve a intentarlo en unos momentos.';
  }

  return message ?? 'No fue posible completar la solicitud.';
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

  let response;
  try {
    response = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'same-origin',
    });
  } catch {
    throw new Error('No fue posible conectar con la plataforma. Recarga la página y vuelve a intentarlo.');
  }

  const payload = await response
    .json()
    .catch(() => ({ ok: false, error: { message: 'La respuesta recibida no pudo interpretarse correctamente.' } }));

  if (!response.ok || !payload.ok) {
    throw new Error(buildFriendlyMessage(response, payload));
  }

  return payload.data;
}

export function fetchCalculators() {
  return requestJson('/api/calculators');
}

export function fetchExercises(unit = 'all') {
  return requestJson(`/api/exercises?unit=${encodeURIComponent(unit)}`);
}

export function fetchCommonErrors() {
  return requestJson('/api/common-errors');
}

export function fetchConverterCatalog() {
  return requestJson('/api/converter');
}

export function convertUnits({ category, fromUnit, toUnit, value }) {
  const query = new URLSearchParams({ category, fromUnit, toUnit, value }).toString();
  return requestJson(`/api/convert?${query}`);
}

export function generateExercise({ unit, difficulty }) {
  const query = new URLSearchParams({ unit, difficulty }).toString();
  return requestJson(`/api/generated-exercise?${query}`);
}

export function calculate(calculatorId, values) {
  return requestJson(`/api/calculate/${calculatorId}`, {
    method: 'POST',
    body: JSON.stringify(values),
  });
}
