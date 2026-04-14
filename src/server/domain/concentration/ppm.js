import { roundTo } from '../../utils/math.js';

function buildSummary(values) {
  return [
    { label: 'Masa de soluto', value: roundTo(values.soluteMassMilligrams, 6), unit: 'mg' },
    { label: 'Volumen de solucion', value: roundTo(values.solutionVolumeLiters, 6), unit: 'L' },
    { label: 'Concentracion', value: roundTo(values.ppm, 6), unit: 'ppm' },
  ];
}

export function solvePpm(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: 'ppm ~= mg de soluto / L de solucion',
      explanation: 'En soluciones acuosas diluidas, 1 ppm se aproxima a 1 mg/L.',
    },
  ];

  if (missingField === 'ppm') {
    resolved.ppm = roundTo(resolved.soluteMassMilligrams / resolved.solutionVolumeLiters, 6);
    steps.push(
      {
        title: 'Sustitucion',
        equation: `ppm ~= ${resolved.soluteMassMilligrams} mg / ${resolved.solutionVolumeLiters} L`,
        explanation: 'Se divide la masa de soluto expresada en miligramos por el volumen en litros.',
      },
      {
        title: 'Resultado',
        equation: `ppm ~= ${resolved.ppm}`,
        explanation: `La solucion presenta aproximadamente ${resolved.ppm} mg de soluto por litro.`,
      },
    );
  }

  if (missingField === 'soluteMassMilligrams') {
    resolved.soluteMassMilligrams = roundTo(resolved.ppm * resolved.solutionVolumeLiters, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'masa de soluto = ppm * volumen de solucion',
        explanation: 'Se recupera la masa de soluto en miligramos a partir de la concentracion y el volumen.',
      },
      {
        title: 'Resultado',
        equation: `masa de soluto = ${resolved.ppm} * ${resolved.solutionVolumeLiters} = ${resolved.soluteMassMilligrams} mg`,
        explanation: 'El resultado corresponde a la masa presente en la muestra total analizada.',
      },
    );
  }

  if (missingField === 'solutionVolumeLiters') {
    resolved.solutionVolumeLiters = roundTo(resolved.soluteMassMilligrams / resolved.ppm, 6);
    steps.push(
      {
        title: 'Despeje',
        equation: 'volumen de solucion = masa de soluto / ppm',
        explanation: 'Se despeja el volumen total cuando conoces la masa de soluto y la concentracion.',
      },
      {
        title: 'Resultado',
        equation: `volumen de solucion = ${resolved.soluteMassMilligrams} / ${resolved.ppm} = ${resolved.solutionVolumeLiters} L`,
        explanation: 'La aproximacion es valida para soluciones suficientemente diluidas.',
      },
    );
  }

  return {
    calculatorId: 'ppm',
    solvedField: missingField,
    primaryResult:
      missingField === 'ppm'
        ? { label: 'Concentracion calculada', value: resolved.ppm, unit: 'ppm' }
        : missingField === 'soluteMassMilligrams'
          ? { label: 'Masa de soluto', value: resolved.soluteMassMilligrams, unit: 'mg' }
          : { label: 'Volumen de solucion', value: resolved.solutionVolumeLiters, unit: 'L' },
    summary: buildSummary(resolved),
    steps,
    interpretation: `Interpretacion: ${resolved.ppm} ppm equivale aproximadamente a ${resolved.ppm} mg/L en soluciones acuosas diluidas.`,
    checks: [
      'La equivalencia ppm ~= mg/L se aplico bajo la aproximacion de solucion diluida.',
      'La masa se trabajo en mg y el volumen en L para conservar coherencia.',
    ],
  };
}
