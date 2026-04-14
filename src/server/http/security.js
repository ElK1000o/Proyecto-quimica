import { randomBytes } from 'node:crypto';

import { AppError } from '../utils/errors.js';
import { parseCookies, serializeCookie } from '../utils/cookies.js';

export function applySecurityHeaders(response, production) {
  response.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "base-uri 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
    ].join('; '),
  );
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  if (production) {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

export function ensureCsrfCookie(request, response, production) {
  const cookies = parseCookies(request.headers.cookie ?? '');
  if (cookies['csrf-token']) {
    return cookies['csrf-token'];
  }

  const token = randomBytes(24).toString('base64url');
  response.setHeader(
    'Set-Cookie',
    serializeCookie('csrf-token', token, {
      path: '/',
      maxAge: 60 * 60 * 8,
      sameSite: 'Strict',
      secure: production,
    }),
  );

  return token;
}

export function assertTrustedMutation(request, requestUrl, configuredOrigin) {
  const method = request.method ?? 'GET';
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return;
  }

  const originHeader = request.headers.origin;
  const origin = configuredOrigin || `${requestUrl.protocol}//${requestUrl.host}`;
  if (originHeader !== origin) {
    throw new AppError(403, 'Origen no permitido para solicitudes mutables.', { code: 'origin_forbidden' });
  }

  const cookies = parseCookies(request.headers.cookie ?? '');
  const csrfToken = request.headers['x-csrf-token'];
  if (!cookies['csrf-token'] || typeof csrfToken !== 'string' || csrfToken !== cookies['csrf-token']) {
    throw new AppError(403, 'Token CSRF invalido.', { code: 'csrf_invalid' });
  }
}
