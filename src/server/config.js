import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(serverDir, '..', '..');

function toPort(rawValue) {
  const parsed = Number.parseInt(rawValue ?? '3000', 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 3000;
}

export const config = {
  host: process.env.HOST ?? '127.0.0.1',
  port: toPort(process.env.PORT),
  environment: process.env.NODE_ENV ?? 'development',
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? '',
  maxJsonBytes: 10_000,
  rateLimitWindowMs: 60_000,
  rateLimitMaxRequests: 80,
  publicDir: path.join(rootDir, 'src', 'client'),
};

export function isProduction() {
  return config.environment === 'production';
}
