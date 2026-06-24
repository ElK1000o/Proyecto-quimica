import { AppError } from '../utils/errors.js';
import { assertAllowedKeys, assertExactlyOneMissing, assertPlainObject, parseOptionalNumber } from './common.js';

function validateTriplet(payload, labels, parsers) {
  assertPlainObject(payload);
  assertAllowedKeys(payload, Object.keys(labels));

  const values = {};
  for (const [field, options] of Object.entries(parsers)) {
    values[field] = parseOptionalNumber(payload, field, labels[field], options);
  }

  const missingField = assertExactlyOneMissing(values, labels);
  return { values, missingField, labels };
}

export function validateMassMassInput(payload) {
  const labels = {
    soluteMassGrams: 'Masa de soluto',
    solutionMassGrams: 'Masa de solucion',
    percent: 'Porcentaje masa/masa',
  };

  const result = validateTriplet(payload, labels, {
    soluteMassGrams: {},
    solutionMassGrams: {},
    percent: { min: 0.000001, max: 100 },
  });

  if (
    result.values.soluteMassGrams !== null &&
    result.values.solutionMassGrams !== null &&
    result.values.soluteMassGrams > result.values.solutionMassGrams
  ) {
    throw new AppError(400, 'La masa del soluto no puede superar la masa total de la solucion.', {
      code: 'invalid_mass_relation',
    });
  }

  return result;
}

export function validateMassVolumeInput(payload) {
  const labels = {
    soluteMassGrams: 'Masa de soluto',
    solutionVolumeMilliliters: 'Volumen de solucion',
    percent: 'Porcentaje masa/volumen',
  };

  return validateTriplet(payload, labels, {
    soluteMassGrams: {},
    solutionVolumeMilliliters: {},
    percent: { min: 0.000001, max: 100 },
  });
}

export function validateVolumeVolumeInput(payload) {
  const labels = {
    soluteVolumeMilliliters: 'Volumen de soluto',
    solutionVolumeMilliliters: 'Volumen de solucion',
    percent: 'Porcentaje volumen/volumen',
  };

  const result = validateTriplet(payload, labels, {
    soluteVolumeMilliliters: {},
    solutionVolumeMilliliters: {},
    percent: { min: 0.000001, max: 100 },
  });

  if (
    result.values.soluteVolumeMilliliters !== null &&
    result.values.solutionVolumeMilliliters !== null &&
    result.values.soluteVolumeMilliliters > result.values.solutionVolumeMilliliters
  ) {
    throw new AppError(400, 'El volumen del soluto no puede superar el volumen total de la solucion.', {
      code: 'invalid_volume_relation',
    });
  }

  return result;
}

export function validatePpmInput(payload) {
  const labels = {
    soluteMassMilligrams: 'Masa de soluto',
    solutionVolumeLiters: 'Volumen de solucion',
    ppm: 'Concentracion en ppm',
  };

  return validateTriplet(payload, labels, {
    soluteMassMilligrams: {},
    solutionVolumeLiters: {},
    ppm: { min: 0.000001 },
  });
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

export function validateNormalityInput(payload) {
  const labels = {
    normalityEqPerL: 'Normalidad',
    massSoluteGrams: 'Masa de soluto',
    molarMassGramsPerMol: 'Masa molar',
    equivalenceFactor: 'Factor de equivalencia',
    solutionVolumeLiters: 'Volumen de solucion',
  };

  assertPlainObject(payload);
  assertAllowedKeys(payload, Object.keys(labels));

  const values = {
    normalityEqPerL: parseOptionalNumber(payload, 'normalityEqPerL', labels.normalityEqPerL),
    massSoluteGrams: parseOptionalNumber(payload, 'massSoluteGrams', labels.massSoluteGrams),
    molarMassGramsPerMol: parseOptionalNumber(payload, 'molarMassGramsPerMol', labels.molarMassGramsPerMol),
    equivalenceFactor: parseOptionalNumber(payload, 'equivalenceFactor', labels.equivalenceFactor, { min: 0.000001, max: 20 }),
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

  const result = validateTriplet(payload, labels, {
    moleFraction: { min: 0.000001, max: 0.999999 },
    molesComponent: {},
    molesOther: {},
  });

  if (result.values.moleFraction !== null && (result.values.moleFraction <= 0 || result.values.moleFraction >= 1)) {
    throw new AppError(400, 'La fraccion molar debe estar entre 0 y 1, sin incluir los extremos.', {
      code: 'invalid_mole_fraction_range',
    });
  }

  return result;
}
