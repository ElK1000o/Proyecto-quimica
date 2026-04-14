import { calculatorCatalog } from '../content/calculatorCatalog.js';
import { config } from '../config.js';
import { readJsonBody } from '../http/request.js';
import { sendJson } from '../http/response.js';
import { calculate } from '../services/calculationEngine.js';
import { convertValue, converterCatalog } from '../services/conversionService.js';
import { generateExercise } from '../services/generatorService.js';
import { listCalculators, listCommonErrors, listExercises } from '../services/studyContentService.js';
import { AppError } from '../utils/errors.js';

export async function handleApiRequest({ request, response, pathname, searchParams }) {
  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, {
      ok: true,
      data: {
        status: 'ok',
        service: 'concentraciones-quimicas',
        timestamp: new Date().toISOString(),
      },
    });
    return true;
  }

  if (pathname === '/api/calculators' && request.method === 'GET') {
    sendJson(response, 200, {
      ok: true,
      data: listCalculators(),
    });
    return true;
  }

  if (pathname === '/api/exercises' && request.method === 'GET') {
    const unit = searchParams.get('unit') ?? 'all';
    sendJson(response, 200, {
      ok: true,
      data: listExercises(unit),
    });
    return true;
  }

  if (pathname === '/api/common-errors' && request.method === 'GET') {
    sendJson(response, 200, {
      ok: true,
      data: listCommonErrors(),
    });
    return true;
  }

  if (pathname === '/api/converter' && request.method === 'GET') {
    sendJson(response, 200, {
      ok: true,
      data: converterCatalog,
    });
    return true;
  }

  if (pathname === '/api/convert' && request.method === 'GET') {
    const result = convertValue({
      category: searchParams.get('category') ?? '',
      fromUnit: searchParams.get('fromUnit') ?? '',
      toUnit: searchParams.get('toUnit') ?? '',
      value: searchParams.get('value') ?? '',
    });
    sendJson(response, 200, {
      ok: true,
      data: result,
    });
    return true;
  }

  if (pathname === '/api/generated-exercise' && request.method === 'GET') {
    const result = generateExercise({
      unit: searchParams.get('unit') ?? 'all',
      difficulty: searchParams.get('difficulty') ?? 'basico',
    });
    sendJson(response, 200, {
      ok: true,
      data: result,
    });
    return true;
  }

  if (pathname.startsWith('/api/calculate/') && request.method === 'POST') {
    const contentType = request.headers['content-type'] ?? '';
    if (!contentType.includes('application/json')) {
      throw new AppError(415, 'El endpoint solo acepta application/json.', { code: 'unsupported_media_type' });
    }

    const calculatorId = pathname.replace('/api/calculate/', '');
    const payload = await readJsonBody(request, config.maxJsonBytes);
    const result = calculate(calculatorId, payload);
    sendJson(response, 200, {
      ok: true,
      data: result,
    });
    return true;
  }

  return false;
}
