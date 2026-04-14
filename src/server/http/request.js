import { AppError } from '../utils/errors.js';

export async function readJsonBody(request, maxBytes) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    request.on('data', (chunk) => {
      totalBytes += chunk.length;

      if (totalBytes > maxBytes) {
        reject(new AppError(413, 'La solicitud excede el tamano permitido.', { code: 'payload_too_large' }));
        request.destroy();
        return;
      }

      chunks.push(chunk);
    });

    request.on('end', () => {
      try {
        if (chunks.length === 0) {
          resolve({});
          return;
        }

        const rawBody = Buffer.concat(chunks).toString('utf8');
        resolve(JSON.parse(rawBody));
      } catch {
        reject(new AppError(400, 'El cuerpo JSON es invalido.', { code: 'invalid_json' }));
      }
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

export function getClientIp(request) {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }

  return request.socket.remoteAddress ?? '127.0.0.1';
}
