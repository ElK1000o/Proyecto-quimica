import { exerciseBank } from '../content/exerciseBank.js';

export function listExercises(unit = 'all') {
  if (!unit || unit === 'all') {
    return exerciseBank;
  }

  return exerciseBank.filter((exercise) => exercise.unit === unit);
}
