import { solveMassMass } from '../domain/concentration/massMass.js';
import { solveMassVolume } from '../domain/concentration/massVolume.js';
import { solveVolumeVolume } from '../domain/concentration/volumeVolume.js';
import { solvePpm } from '../domain/concentration/ppm.js';
import { solveMolarity } from '../domain/concentration/molarity.js';
import { solveNormality } from '../domain/concentration/normality.js';
import { solveMoleFraction } from '../domain/concentration/moleFraction.js';
import {
  validateMassMassInput,
  validateMassVolumeInput,
  validateVolumeVolumeInput,
  validatePpmInput,
  validateMolarityInput,
  validateNormalityInput,
  validateMoleFractionInput,
} from '../validators/calculationSchemas.js';
import { AppError } from '../utils/errors.js';

const calculatorMap = {
  'mass-mass': { validate: validateMassMassInput, solve: solveMassMass },
  'mass-volume': { validate: validateMassVolumeInput, solve: solveMassVolume },
  'volume-volume': { validate: validateVolumeVolumeInput, solve: solveVolumeVolume },
  ppm: { validate: validatePpmInput, solve: solvePpm },
  molarity: { validate: validateMolarityInput, solve: solveMolarity },
  normality: { validate: validateNormalityInput, solve: solveNormality },
  'mole-fraction': { validate: validateMoleFractionInput, solve: solveMoleFraction },
};

export function calculate(calculatorId, payload) {
  const calculator = calculatorMap[calculatorId];
  if (!calculator) {
    throw new AppError(404, 'Calculadora no soportada.', {
      code: 'calculator_not_found',
    });
  }

  const { values, missingField } = calculator.validate(payload);
  return calculator.solve(values, missingField);
}
