import { access, stat } from 'node:fs/promises';
import { constants as fileConstants } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import { config, isProduction } from './config.js';
import { RateLimiter } from './http/rateLimiter.js';
import { sendFile, sendJson, sendNoContent } from './http/response.js';
import { applySecurityHeaders, assertTrustedMutation, ensureCsrfCookie } from './http/security.js';
import { handleApiRequest } from './routes/studyApi.js';
import { AppError, toErrorPayload } from './utils/errors.js';
import { getClientIp } from './http/request.js';
import { logSecurityEvent } from './utils/logging.js';

const rateLimiter = new RateLimiter({
  windowMs: config.rateLimitWindowMs,
  maxRequests: config.rateLimitMaxRequests,
});

async function resolveStaticFile(pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const normalizedPath = path.normalize(decodeURIComponent(requestedPath));
  const absolutePath = path.resolve(config.publicDir, `.${normalizedPath}`);

  if (!absolutePath.startsWith(config.publicDir)) {
    throw new AppError(403, 'Ruta no permitida.', { code: 'path_traversal_blocked' });
  }

  try {
    await access(absolutePath, fileConstants.R_OK);
    const info = await stat(absolutePath);
    if (info.isFile()) {
      return absolutePath;
    }
  } catch {
    return path.join(config.publicDir, 'index.html');
  }

  return path.join(config.publicDir, 'index.html');
}

export function createApp() {
  return async function requestHandler(request, response) {
    const requestId = randomUUID();
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? `${config.host}:${config.port}`}`);
    const production = isProduction();
    response.setHeader('X-Request-Id', requestId);
    applySecurityHeaders(response, production);
    ensureCsrfCookie(request, response, production);

    try {
      const rateLimit = rateLimiter.consume(getClientIp(request));
      response.setHeader('RateLimit-Limit', String(config.rateLimitMaxRequests));
      response.setHeader('RateLimit-Remaining', String(rateLimit.remaining));

      if (!rateLimit.allowed) {
        response.setHeader('Retry-After', String(rateLimit.retryAfterSeconds ?? 60));
        throw new AppError(429, 'Se alcanzo el limite de solicitudes. Intenta nuevamente en breve.', {
          code: 'rate_limit_exceeded',
        });
      }

      if (request.method === 'OPTIONS') {
        sendNoContent(response);
        return;
      }

      assertTrustedMutation(request, requestUrl, config.allowedOrigin);

      const isApiRequest = requestUrl.pathname.startsWith('/api/');
      if (isApiRequest) {
        const handled = await handleApiRequest({
          request,
          response,
          pathname: requestUrl.pathname,
          searchParams: requestUrl.searchParams,
        });

        if (!handled) {
          throw new AppError(404, 'La ruta solicitada no esta disponible.', { code: 'endpoint_not_found' });
        }

        return;
      }

      const filePath = await resolveStaticFile(requestUrl.pathname);
      await sendFile(response, filePath);
    } catch (error) {
      if (error instanceof AppError && error.statusCode >= 400) {
        logSecurityEvent(error.code, {
          requestId,
          path: requestUrl.pathname,
          method: request.method,
          message: error.message,
        });
      } else {
        console.error(`[${requestId}]`, error);
      }

      const { statusCode, payload } = toErrorPayload(error, config.environment);
      sendJson(response, statusCode, payload);
    }
  };
}
