import { AppError } from '../utils/errors.js';

const NUMBER_PATTERN = /^-?\d+(?:[.,]\d+)?(?:e[+-]?\d+)?$/i;

export function assertPlainObject(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new AppError(400, 'La solicitud debe ser un objeto JSON valido.', { code: 'invalid_payload' });
  }
}

export function assertAllowedKeys(payload, allowedKeys) {
  const extraKeys = Object.keys(payload).filter((key) => !allowedKeys.includes(key));
  if (extraKeys.length > 0) {
    throw new AppError(400, `Campos no permitidos: ${extraKeys.join(', ')}.`, {
      code: 'unexpected_fields',
      details: { extraKeys },
    });
  }
}

export function parseOptionalNumber(payload, fieldName, label, options = {}) {
  const rawValue = payload[fieldName];
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  if (typeof rawValue !== 'number' && typeof rawValue !== 'string') {
    throw new AppError(400, `${label} debe ser numerico.`, { code: 'invalid_number' });
  }

  const normalized = String(rawValue).trim().replace(/\s+/g, '').replace(',', '.');
  if (normalized.length === 0) {
    return null;
  }

  if (normalized.length > 40 || !NUMBER_PATTERN.test(normalized)) {
    throw new AppError(400, `${label} debe contener un numero valido.`, { code: 'invalid_number_format' });
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) {
    throw new AppError(400, `${label} debe ser un numero finito.`, { code: 'invalid_number_value' });
  }

  const allowZero = options.allowZero ?? false;
  if ((!allowZero && value <= 0) || (allowZero && value < 0)) {
    throw new AppError(400, `${label} debe ser ${allowZero ? 'mayor o igual a 0' : 'mayor que 0'}.`, {
      code: 'invalid_positive_number',
    });
  }

  if (options.min !== undefined && value < options.min) {
    throw new AppError(400, `${label} debe ser mayor o igual a ${options.min}.`, { code: 'min_violation' });
  }

  if (options.max !== undefined && value > options.max) {
    throw new AppError(400, `${label} debe ser menor o igual a ${options.max}.`, { code: 'max_violation' });
  }

  return value;
}

export function assertExactlyOneMissing(values, labels) {
  const missingKeys = Object.entries(values)
    .filter(([, value]) => value === null)
    .map(([key]) => key);

  if (missingKeys.length !== 1) {
    throw new AppError(400, 'Debes dejar exactamente un campo vacio para resolver la variable faltante.', {
      code: 'exactly_one_missing_required',
      details: {
        missing: missingKeys,
        labels,
      },
    });
  }

  return missingKeys[0];
}
