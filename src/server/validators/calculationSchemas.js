import { AppError } from '../utils/errors.js';
import { assertAllowedKeys, assertExactlyOneMissing, assertPlainObject, parseOptionalNumber } from './common.js';

export function validateMassMassInput(payload) {
  const labels = {
    soluteMassGrams: 'Masa de soluto',
    solutionMassGrams: 'Masa de solucion',
    percent: 'Porcentaje masa/masa',
  };

  assertPlainObject(payload);
  assertAllowedKeys(payload, Object.keys(labels));

  const values = {
    soluteMassGrams: parseOptionalNumber(payload, 'soluteMassGrams', labels.soluteMassGrams),
    solutionMassGrams: parseOptionalNumber(payload, 'solutionMassGrams', labels.solutionMassGrams),
    percent: parseOptionalNumber(payload, 'percent', labels.percent, { min: 0.000001, max: 100 }),
  };

  const missingField = assertExactlyOneMissing(values, labels);

  if (values.soluteMassGrams !== null && values.solutionMassGrams !== null && values.soluteMassGrams > values.solutionMassGrams) {
    throw new AppError(400, 'La masa del soluto no puede superar la masa total de la solucion.', {
      code: 'invalid_mass_relation',
    });
  }

  return { values, missingField, labels };
}

export function validateMolarityInput(payload) {
  const labels = {
    molarityMolPerL: 'Molaridad',
    massSoluteGrams: 'Masa de soluto',
    molarMassGramsPerMol: 'Masa molar',
    solutionVolumeLiters: 'Volumen de solucion',
  };

  assertPlainObject(payload);
  assertAllowedKeys(payload, Object.keys(labels));

  const values = {
    molarityMolPerL: parseOptionalNumber(payload, 'molarityMolPerL', labels.molarityMolPerL),
    massSoluteGrams: parseOptionalNumber(payload, 'massSoluteGrams', labels.massSoluteGrams),
    molarMassGramsPerMol: parseOptionalNumber(payload, 'molarMassGramsPerMol', labels.molarMassGramsPerMol),
    solutionVolumeLiters: parseOptionalNumber(payload, 'solutionVolumeLiters', labels.solutionVolumeLiters),
  };

  const missingField = assertExactlyOneMissing(values, labels);
  return { values, missingField, labels };
}

export function validateMoleFractionInput(payload) {
  const labels = {
    moleFraction: 'Fraccion molar',
    molesComponent: 'Moles del componente de interes',
    molesOther: 'Moles del resto de la mezcla',
  };

  assertPlainObject(payload);
  assertAllowedKeys(payload, Object.keys(labels));

  const values = {
    moleFraction: parseOptionalNumber(payload, 'moleFraction', labels.moleFraction, { min: 0.000001, max: 0.999999 }),
    molesComponent: parseOptionalNumber(payload, 'molesComponent', labels.molesComponent),
    molesOther: parseOptionalNumber(payload, 'molesOther', labels.molesOther),
  };

  const missingField = assertExactlyOneMissing(values, labels);

  if (values.moleFraction !== null && (values.moleFraction <= 0 || values.moleFraction >= 1)) {
    throw new AppError(400, 'La fraccion molar debe estar entre 0 y 1, sin incluir los extremos.', {
      code: 'invalid_mole_fraction_range',
    });
  }

  return { values, missingField, labels };
}
