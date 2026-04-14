import { roundTo } from '../../utils/math.js';

function buildSummary(values) {
  return [
    { label: 'Masa de soluto', value: roundTo(values.soluteMassGrams, 6), unit: 'g' },
    { label: 'Volumen de solucion', value: roundTo(values.solutionVolumeMilliliters, 6), unit: 'mL' },
    { label: 'Concentracion', value: roundTo(values.percent, 6), unit: '% m/v' },
  ];
}

export function solveMassVolume(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: '% m/v = (masa de soluto / volumen de solucion) * 100',
      explanation: 'El porcentaje masa/volumen indica cuantos gramos de soluto hay por cada 100 mL de solucion.',
    },
  ];

  if (missingField === 'percent') {
    resolved.percent = roundTo((resolved.soluteMassGrams / resolved.solutionVolumeMilliliters) * 100, 6);
    steps.push(
      {
        title: 'Sustitucion',
        equation: `% m/v = (${resolved.soluteMassGrams} g / ${resolved.solutionVolumeMilliliters} mL) * 100`,
        explanation: 'Se divide la masa de soluto por el volumen final de la solucion y luego se multiplica por 100.',
      },
      {
        title: 'Resultado',
        equation: `% m/v = ${resolved.percent}`,
        explanation: `La solucion contiene ${resolved.percent} g de soluto por cada 100 mL de solucion.`,
      },
    );
  }

  if (missingField === 'soluteMassGrams') {
    resolved.soluteMassGrams = roundTo((resolved.percent * resolved.solutionVolumeMilliliters) / 100, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'masa de soluto = (% m/v * volumen de solucion) / 100',
        explanation: 'Se despeja la masa del soluto a partir de la concentracion y del volumen final.',
      },
      {
        title: 'Resultado',
        equation: `masa de soluto = (${resolved.percent} * ${resolved.solutionVolumeMilliliters}) / 100 = ${resolved.soluteMassGrams} g`,
        explanation: 'Ese valor corresponde a la masa necesaria para alcanzar la concentracion solicitada.',
      },
    );
  }

  if (missingField === 'solutionVolumeMilliliters') {
    resolved.solutionVolumeMilliliters = roundTo((resolved.soluteMassGrams * 100) / resolved.percent, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'volumen de solucion = (masa de soluto * 100) / % m/v',
        explanation: 'El volumen final de solucion se obtiene al dividir la masa entre la concentracion expresada por 100 mL.',
      },
      {
        title: 'Resultado',
        equation: `volumen de solucion = (${resolved.soluteMassGrams} * 100) / ${resolved.percent} = ${resolved.solutionVolumeMilliliters} mL`,
        explanation: 'Recuerda que se trata del volumen final de la solucion, no solo del solvente agregado.',
      },
    );
  }

  return {
    calculatorId: 'mass-volume',
    solvedField: missingField,
    primaryResult:
      missingField === 'percent'
        ? { label: 'Concentracion calculada', value: resolved.percent, unit: '% m/v' }
        : missingField === 'soluteMassGrams'
          ? { label: 'Masa de soluto', value: resolved.soluteMassGrams, unit: 'g' }
          : { label: 'Volumen de solucion', value: resolved.solutionVolumeMilliliters, unit: 'mL' },
    summary: buildSummary(resolved),
    steps,
    interpretation: `Interpretacion: ${resolved.percent}% m/v significa ${resolved.percent} g de soluto por cada 100 mL de solucion.`,
    checks: [
      'El volumen usado corresponde al volumen total de la solucion.',
      'Las unidades del procedimiento se mantuvieron en g y mL.',
    ],
  };
}
