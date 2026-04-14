import { roundTo } from '../../utils/math.js';

function buildSummary(values) {
  return [
    { label: 'Masa de soluto', value: roundTo(values.soluteMassGrams, 6), unit: 'g' },
    { label: 'Masa de solucion', value: roundTo(values.solutionMassGrams, 6), unit: 'g' },
    { label: 'Concentracion', value: roundTo(values.percent, 6), unit: '% m/m' },
  ];
}

export function solveMassMass(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: '% m/m = (masa de soluto / masa de solucion) * 100',
      explanation: 'El porcentaje masa/masa compara la masa del soluto con la masa total de la solucion.',
    },
  ];

  if (missingField === 'percent') {
    const ratio = resolved.soluteMassGrams / resolved.solutionMassGrams;
    resolved.percent = roundTo(ratio * 100, 6);
    steps.push(
      {
        title: 'Sustitucion',
        equation: `% m/m = (${roundTo(resolved.soluteMassGrams, 6)} g / ${roundTo(resolved.solutionMassGrams, 6)} g) * 100`,
        explanation: 'Las unidades de masa se cancelan y queda una relacion adimensional.',
      },
      {
        title: 'Resultado',
        equation: `% m/m = ${resolved.percent}`,
        explanation: `La solucion contiene ${resolved.percent} g de soluto por cada 100 g de solucion.`,
      },
    );
  }

  if (missingField === 'soluteMassGrams') {
    resolved.soluteMassGrams = roundTo((resolved.percent / 100) * resolved.solutionMassGrams, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'masa de soluto = (% m/m / 100) * masa de solucion',
        explanation: 'Se multiplica la fraccion masica por la masa total de la solucion.',
      },
      {
        title: 'Resultado',
        equation: `masa de soluto = (${resolved.percent} / 100) * ${resolved.solutionMassGrams} = ${resolved.soluteMassGrams} g`,
        explanation: 'Ese valor representa la cantidad de soluto puro presente en la mezcla.',
      },
    );
  }

  if (missingField === 'solutionMassGrams') {
    resolved.solutionMassGrams = roundTo((resolved.soluteMassGrams * 100) / resolved.percent, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'masa de solucion = (masa de soluto * 100) / % m/m',
        explanation: 'La masa total se obtiene al dividir la masa del soluto por su fraccion en la mezcla.',
      },
      {
        title: 'Resultado',
        equation: `masa de solucion = (${resolved.soluteMassGrams} * 100) / ${resolved.percent} = ${resolved.solutionMassGrams} g`,
        explanation: 'El valor obtenido incluye soluto y solvente.',
      },
    );
  }

  return {
    calculatorId: 'mass-mass',
    solvedField: missingField,
    primaryResult:
      missingField === 'percent'
        ? { label: 'Concentracion calculada', value: resolved.percent, unit: '% m/m' }
        : missingField === 'soluteMassGrams'
          ? { label: 'Masa de soluto', value: resolved.soluteMassGrams, unit: 'g' }
          : { label: 'Masa de solucion', value: resolved.solutionMassGrams, unit: 'g' },
    summary: buildSummary(resolved),
    steps,
    interpretation: `Resumen fisico: ${resolved.percent}% m/m equivale a ${resolved.percent} g de soluto por cada 100 g de solucion.`,
    checks: [
      'La masa del soluto no supera la masa total de la solucion.',
      'Las entradas se trataron como gramos para mantener consistencia dimensional.',
    ],
  };
}
