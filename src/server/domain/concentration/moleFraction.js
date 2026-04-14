import { roundTo } from '../../utils/math.js';

function buildSummary(values) {
  const totalMoles = values.molesComponent + values.molesOther;
  return [
    { label: 'Fraccion molar del componente', value: roundTo(values.moleFraction, 6), unit: 'X' },
    { label: 'Moles del componente', value: roundTo(values.molesComponent, 6), unit: 'mol' },
    { label: 'Moles del resto', value: roundTo(values.molesOther, 6), unit: 'mol' },
    { label: 'Moles totales', value: roundTo(totalMoles, 6), unit: 'mol' },
  ];
}

export function solveMoleFraction(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: 'X_i = n_i / (n_i + n_j)',
      explanation: 'La fraccion molar expresa la proporcion de moles de un componente respecto al total de la mezcla.',
    },
  ];

  if (missingField === 'moleFraction') {
    const totalMoles = resolved.molesComponent + resolved.molesOther;
    resolved.moleFraction = roundTo(resolved.molesComponent / totalMoles, 6);
    steps.push(
      {
        title: 'Suma de moles',
        equation: `n_total = ${resolved.molesComponent} + ${resolved.molesOther} = ${roundTo(totalMoles, 6)} mol`,
        explanation: 'Primero se obtiene la cantidad total de sustancia presente en la mezcla binaria.',
      },
      {
        title: 'Calculo de la fraccion molar',
        equation: `X_i = ${resolved.molesComponent} / ${roundTo(totalMoles, 6)} = ${resolved.moleFraction}`,
        explanation: 'El valor no tiene unidades y siempre queda entre 0 y 1.',
      },
    );
  }

  if (missingField === 'molesComponent') {
    resolved.molesComponent = roundTo((resolved.moleFraction * resolved.molesOther) / (1 - resolved.moleFraction), 6);
    steps.push(
      {
        title: 'Despeje algebraico',
        equation: 'n_i = (X_i * n_j) / (1 - X_i)',
        explanation: 'Se aísla la cantidad de moles del componente de interes a partir de la definicion de fraccion molar.',
      },
      {
        title: 'Resultado',
        equation: `n_i = (${resolved.moleFraction} * ${resolved.molesOther}) / (1 - ${resolved.moleFraction}) = ${resolved.molesComponent} mol`,
        explanation: 'Ese valor es consistente con una mezcla binaria del total indicado.',
      },
    );
  }

  if (missingField === 'molesOther') {
    resolved.molesOther = roundTo((resolved.molesComponent * (1 - resolved.moleFraction)) / resolved.moleFraction, 6);
    steps.push(
      {
        title: 'Despeje algebraico',
        equation: 'n_j = n_i * (1 - X_i) / X_i',
        explanation: 'Se despeja la cantidad de moles del resto de la mezcla manteniendo constante la fraccion molar objetivo.',
      },
      {
        title: 'Resultado',
        equation: `n_j = ${resolved.molesComponent} * (1 - ${resolved.moleFraction}) / ${resolved.moleFraction} = ${resolved.molesOther} mol`,
        explanation: 'El resultado representa los moles de los demas componentes agrupados.',
      },
    );
  }

  return {
    calculatorId: 'mole-fraction',
    solvedField: missingField,
    primaryResult:
      missingField === 'moleFraction'
        ? { label: 'Fraccion molar', value: resolved.moleFraction, unit: 'X' }
        : missingField === 'molesComponent'
          ? { label: 'Moles del componente', value: resolved.molesComponent, unit: 'mol' }
          : { label: 'Moles del resto', value: resolved.molesOther, unit: 'mol' },
    summary: buildSummary(resolved),
    steps,
    interpretation: `El componente de interes representa ${roundTo(resolved.moleFraction * 100, 4)}% de los moles totales de la mezcla.`,
    checks: [
      'La fraccion molar es adimensional y la suma de fracciones molares del sistema debe ser 1.',
      'Esta resolucion trabaja con mezclas binarias para mantener claro el procedimiento.',
    ],
  };
}
