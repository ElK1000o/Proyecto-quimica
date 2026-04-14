import { AppError } from '../utils/errors.js';

export const converterCatalog = {
  mass: {
    label: 'Masa',
    baseUnit: 'g',
    units: {
      mg: { label: 'mg', factor: 0.001 },
      g: { label: 'g', factor: 1 },
      kg: { label: 'kg', factor: 1000 },
    },
  },
  volume: {
    label: 'Volumen',
    baseUnit: 'L',
    units: {
      mL: { label: 'mL', factor: 0.001 },
      L: { label: 'L', factor: 1 },
    },
  },
  amount: {
    label: 'Cantidad de sustancia',
    baseUnit: 'mol',
    units: {
      mmol: { label: 'mmol', factor: 0.001 },
      mol: { label: 'mol', factor: 1 },
    },
  },
  concentration: {
    label: 'Concentracion diluida',
    baseUnit: 'mg/L',
    units: {
      'mg/L': { label: 'mg/L', factor: 1 },
      ppm: { label: 'ppm', factor: 1 },
      'g/L': { label: 'g/L', factor: 1000 },
    },
    note: 'La equivalencia entre ppm y mg/L se usa para soluciones acuosas diluidas.',
  },
};

function parseValue(rawValue) {
  const normalized = String(rawValue ?? '').trim().replace(',', '.');
  const value = Number(normalized);
  if (!Number.isFinite(value) || value < 0) {
    throw new AppError(400, 'El valor a convertir debe ser numerico y mayor o igual a 0.', {
      code: 'invalid_conversion_value',
    });
  }

  return value;
}

export function convertValue({ category, fromUnit, toUnit, value }) {
  const catalogEntry = converterCatalog[category];
  if (!catalogEntry) {
    throw new AppError(400, 'Categoria de conversion no soportada.', {
      code: 'invalid_conversion_category',
    });
  }

  const from = catalogEntry.units[fromUnit];
  const to = catalogEntry.units[toUnit];
  if (!from || !to) {
    throw new AppError(400, 'Unidad de conversion no soportada.', {
      code: 'invalid_conversion_unit',
    });
  }

  const parsedValue = parseValue(value);
  const valueInBaseUnit = parsedValue * from.factor;
  const convertedValue = valueInBaseUnit / to.factor;

  return {
    category,
    fromUnit,
    toUnit,
    inputValue: parsedValue,
    outputValue: Number(convertedValue.toFixed(6)),
    explanation: `Se convierte primero a ${catalogEntry.baseUnit} y luego a ${toUnit}.`,
    steps: [
      `${parsedValue} ${fromUnit} = ${Number(valueInBaseUnit.toFixed(6))} ${catalogEntry.baseUnit}`,
      `${Number(valueInBaseUnit.toFixed(6))} ${catalogEntry.baseUnit} = ${Number(convertedValue.toFixed(6))} ${toUnit}`,
    ],
    note: catalogEntry.note ?? null,
  };
}
