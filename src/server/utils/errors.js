export class AppError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = options.code ?? 'app_error';
    this.expose = options.expose ?? statusCode < 500;
    this.details = options.details ?? null;
  }
}

export function toErrorPayload(error, environment) {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      payload: {
        ok: false,
        error: {
          code: error.code,
          message: error.expose ? error.message : 'Error interno del servidor.',
          details: error.details,
        },
      },
    };
  }

  return {
    statusCode: 500,
    payload: {
      ok: false,
      error: {
        code: 'internal_error',
        message: 'Error interno del servidor.',
        details: environment === 'development' ? String(error?.message ?? error) : null,
      },
    },
  };
}
