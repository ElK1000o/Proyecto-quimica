import { roundTo } from '../../utils/math.js';

function buildSummary(values) {
  return [
    { label: 'Volumen de soluto', value: roundTo(values.soluteVolumeMilliliters, 6), unit: 'mL' },
    { label: 'Volumen de solucion', value: roundTo(values.solutionVolumeMilliliters, 6), unit: 'mL' },
    { label: 'Concentracion', value: roundTo(values.percent, 6), unit: '% v/v' },
  ];
}

export function solveVolumeVolume(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: '% v/v = (volumen de soluto / volumen de solucion) * 100',
      explanation: 'El porcentaje volumen/volumen compara el volumen del componente con el volumen final de la mezcla.',
    },
  ];

  if (missingField === 'percent') {
    resolved.percent = roundTo((resolved.soluteVolumeMilliliters / resolved.solutionVolumeMilliliters) * 100, 6);
    steps.push(
      {
        title: 'Sustitucion',
        equation: `% v/v = (${resolved.soluteVolumeMilliliters} mL / ${resolved.solutionVolumeMilliliters} mL) * 100`,
        explanation: 'Ambos volumenes deben estar en la misma unidad antes de sustituir.',
      },
      {
        title: 'Resultado',
        equation: `% v/v = ${resolved.percent}`,
        explanation: `La mezcla contiene ${resolved.percent} mL de soluto por cada 100 mL de solucion.`,
      },
    );
  }

  if (missingField === 'soluteVolumeMilliliters') {
    resolved.soluteVolumeMilliliters = roundTo((resolved.percent * resolved.solutionVolumeMilliliters) / 100, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'volumen de soluto = (% v/v * volumen de solucion) / 100',
        explanation: 'Se obtiene el volumen del componente a partir del porcentaje deseado y del volumen final.',
      },
      {
        title: 'Resultado',
        equation: `volumen de soluto = (${resolved.percent} * ${resolved.solutionVolumeMilliliters}) / 100 = ${resolved.soluteVolumeMilliliters} mL`,
        explanation: 'Ese volumen corresponde al liquido de interes dentro de la mezcla final.',
      },
    );
  }

  if (missingField === 'solutionVolumeMilliliters') {
    resolved.solutionVolumeMilliliters = roundTo((resolved.soluteVolumeMilliliters * 100) / resolved.percent, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'volumen de solucion = (volumen de soluto * 100) / % v/v',
        explanation: 'Se despeja el volumen final de la mezcla manteniendo el porcentaje fijado.',
      },
      {
        title: 'Resultado',
        equation: `volumen de solucion = (${resolved.soluteVolumeMilliliters} * 100) / ${resolved.percent} = ${resolved.solutionVolumeMilliliters} mL`,
        explanation: 'El volumen final incluye al soluto y a los demas componentes liquidos.',
      },
    );
  }

  return {
    calculatorId: 'volume-volume',
    solvedField: missingField,
    primaryResult:
      missingField === 'percent'
        ? { label: 'Concentracion calculada', value: resolved.percent, unit: '% v/v' }
        : missingField === 'soluteVolumeMilliliters'
          ? { label: 'Volumen de soluto', value: resolved.soluteVolumeMilliliters, unit: 'mL' }
          : { label: 'Volumen de solucion', value: resolved.solutionVolumeMilliliters, unit: 'mL' },
    summary: buildSummary(resolved),
    steps,
    interpretation: `Interpretacion: ${resolved.percent}% v/v indica ${resolved.percent} mL de soluto por cada 100 mL de solucion.`,
    checks: [
      'Ambos volumenes se trabajaron en la misma unidad para evitar errores.',
      'El volumen del soluto no supera el volumen total de la solucion.',
    ],
  };
}
