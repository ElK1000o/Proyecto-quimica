import test from 'node:test';
import assert from 'node:assert/strict';

import { calculate } from '../../src/server/services/calculationEngine.js';

test('calcula porcentaje masa/masa cuando falta la concentracion', () => {
  const result = calculate('mass-mass', {
    soluteMassGrams: '18',
    solutionMassGrams: '150',
    percent: '',
  });

  assert.equal(result.primaryResult.value, 12);
});

test('calcula molaridad a partir de masa, masa molar y volumen', () => {
  const result = calculate('molarity', {
    molarityMolPerL: '',
    massSoluteGrams: '29.22',
    molarMassGramsPerMol: '58.44',
    solutionVolumeLiters: '1',
  });

  assert.equal(result.primaryResult.value, 0.5);
});

test('calcula fraccion molar en mezcla binaria', () => {
  const result = calculate('mole-fraction', {
    moleFraction: '',
    molesComponent: '2',
    molesOther: '3',
  });

  assert.equal(result.primaryResult.value, 0.4);
});
