import { solveMassMass } from '../domain/concentration/massMass.js';
import { solveMolarity } from '../domain/concentration/molarity.js';
import { solveMoleFraction } from '../domain/concentration/moleFraction.js';
import {
  validateMassMassInput,
  validateMolarityInput,
  validateMoleFractionInput,
} from '../validators/calculationSchemas.js';
import { AppError } from '../utils/errors.js';

export function calculate(calculatorId, payload) {
  if (calculatorId === 'mass-mass') {
    const { values, missingField } = validateMassMassInput(payload);
    return solveMassMass(values, missingField);
  }

  if (calculatorId === 'molarity') {
    const { values, missingField } = validateMolarityInput(payload);
    return solveMolarity(values, missingField);
  }

  if (calculatorId === 'mole-fraction') {
    const { values, missingField } = validateMoleFractionInput(payload);
    return solveMoleFraction(values, missingField);
  }

  throw new AppError(404, 'Calculadora no soportada.', {
    code: 'calculator_not_found',
  });
}
