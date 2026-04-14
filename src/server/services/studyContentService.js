import { calculators } from '../content/calculators.js';
import { exercises } from '../content/exercises.js';
import { commonErrors } from '../content/commonErrors.js';

export function listCalculators() {
  return calculators;
}

export function getCalculatorById(calculatorId) {
  return calculators.find((calculator) => calculator.id === calculatorId) ?? null;
}

export function listExercises(unit = 'all') {
  if (!unit || unit === 'all') {
    return exercises;
  }

  return exercises.filter((exercise) => exercise.unit === unit);
}

export function listCommonErrors() {
  return commonErrors;
}
