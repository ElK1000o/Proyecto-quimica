import { roundTo } from '../../utils/math.js';

function buildSummary(values, equivalents) {
  return [
    { label: 'Normalidad', value: roundTo(values.normalityEqPerL, 6), unit: 'eq/L' },
    { label: 'Masa de soluto', value: roundTo(values.massSoluteGrams, 6), unit: 'g' },
    { label: 'Masa molar', value: roundTo(values.molarMassGramsPerMol, 6), unit: 'g/mol' },
    { label: 'Factor de equivalencia', value: roundTo(values.equivalenceFactor, 6), unit: 'n' },
    { label: 'Volumen de solucion', value: roundTo(values.solutionVolumeLiters, 6), unit: 'L' },
    { label: 'Equivalentes', value: roundTo(equivalents, 6), unit: 'eq' },
  ];
}

export function solveNormality(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: 'N = eq / V y eq = (masa / masa molar) * factor de equivalencia',
      explanation: 'La normalidad expresa equivalentes quimicos por litro y depende del tipo de reaccion estudiada.',
    },
  ];

  if (missingField === 'normalityEqPerL') {
    const equivalents = (resolved.massSoluteGrams / resolved.molarMassGramsPerMol) * resolved.equivalenceFactor;
    resolved.normalityEqPerL = roundTo(equivalents / resolved.solutionVolumeLiters, 6);
    steps.push(
      {
        title: 'Calcular equivalentes',
        equation: `eq = (${resolved.massSoluteGrams} / ${resolved.molarMassGramsPerMol}) * ${resolved.equivalenceFactor} = ${roundTo(equivalents, 6)} eq`,
        explanation: 'Primero se calculan los moles y luego se ajustan con el factor de equivalencia.',
      },
      {
        title: 'Calcular normalidad',
        equation: `N = ${roundTo(equivalents, 6)} / ${resolved.solutionVolumeLiters} = ${resolved.normalityEqPerL} eq/L`,
        explanation: 'La normalidad final queda expresada en equivalentes por litro.',
      },
    );

    return {
      calculatorId: 'normality',
      solvedField: missingField,
      primaryResult: { label: 'Normalidad calculada', value: resolved.normalityEqPerL, unit: 'eq/L' },
      summary: buildSummary(resolved, equivalents),
      steps,
      interpretation: `La solucion aporta ${resolved.normalityEqPerL} equivalentes quimicos por litro.`,
      checks: [
        'El factor de equivalencia depende de la reaccion considerada.',
        'La normalidad usa volumen final de solucion, no volumen de solvente.',
      ],
    };
  }

  if (missingField === 'massSoluteGrams') {
    const equivalents = resolved.normalityEqPerL * resolved.solutionVolumeLiters;
    resolved.massSoluteGrams = roundTo((equivalents * resolved.molarMassGramsPerMol) / resolved.equivalenceFactor, 6);
    steps.push(
      {
        title: 'Equivalentes requeridos',
        equation: `eq = ${resolved.normalityEqPerL} * ${resolved.solutionVolumeLiters} = ${roundTo(equivalents, 6)} eq`,
        explanation: 'La normalidad y el volumen permiten saber cuantos equivalentes debe contener la solucion.',
      },
      {
        title: 'Convertir equivalentes a masa',
        equation: `masa = (${roundTo(equivalents, 6)} * ${resolved.molarMassGramsPerMol}) / ${resolved.equivalenceFactor} = ${resolved.massSoluteGrams} g`,
        explanation: 'Se recupera la masa usando la masa molar y el factor de equivalencia.',
      },
    );

    return {
      calculatorId: 'normality',
      solvedField: missingField,
      primaryResult: { label: 'Masa de soluto', value: resolved.massSoluteGrams, unit: 'g' },
      summary: buildSummary(resolved, equivalents),
      steps,
      interpretation: `Debes pesar ${resolved.massSoluteGrams} g para preparar la solucion con la normalidad indicada.`,
      checks: [
        'El factor de equivalencia cambia segun el proceso acido-base, redox o de precipitacion.',
        'El volumen se considero en litros para mantener consistencia.',
      ],
    };
  }

  if (missingField === 'molarMassGramsPerMol') {
    const equivalents = resolved.normalityEqPerL * resolved.solutionVolumeLiters;
    resolved.molarMassGramsPerMol = roundTo((resolved.massSoluteGrams * resolved.equivalenceFactor) / equivalents, 6);
    steps.push(
      {
        title: 'Equivalentes presentes',
        equation: `eq = ${resolved.normalityEqPerL} * ${resolved.solutionVolumeLiters} = ${roundTo(equivalents, 6)} eq`,
        explanation: 'Se determina primero la cantidad de equivalentes que contiene la solucion.',
      },
      {
        title: 'Despejar masa molar',
        equation: `masa molar = (${resolved.massSoluteGrams} * ${resolved.equivalenceFactor}) / ${roundTo(equivalents, 6)} = ${resolved.molarMassGramsPerMol} g/mol`,
        explanation: 'La masa molar se obtiene a partir de la relacion entre masa, equivalentes y factor.',
      },
    );

    return {
      calculatorId: 'normality',
      solvedField: missingField,
      primaryResult: { label: 'Masa molar', value: resolved.molarMassGramsPerMol, unit: 'g/mol' },
      summary: buildSummary(resolved, equivalents),
      steps,
      interpretation: `La masa molar estimada del soluto es ${resolved.molarMassGramsPerMol} g/mol.`,
      checks: [
        'Este despeje supone que el factor de equivalencia fue definido correctamente.',
        'La interpretacion depende del contexto de reaccion.',
      ],
    };
  }

  if (missingField === 'equivalenceFactor') {
    const equivalents = resolved.normalityEqPerL * resolved.solutionVolumeLiters;
    resolved.equivalenceFactor = roundTo((equivalents * resolved.molarMassGramsPerMol) / resolved.massSoluteGrams, 6);
    steps.push(
      {
        title: 'Equivalentes presentes',
        equation: `eq = ${resolved.normalityEqPerL} * ${resolved.solutionVolumeLiters} = ${roundTo(equivalents, 6)} eq`,
        explanation: 'La normalidad determina el total de equivalentes en el volumen analizado.',
      },
      {
        title: 'Despejar factor de equivalencia',
        equation: `factor = (${roundTo(equivalents, 6)} * ${resolved.molarMassGramsPerMol}) / ${resolved.massSoluteGrams} = ${resolved.equivalenceFactor}`,
        explanation: 'El factor expresa cuantas cargas, protones o electrones aporta cada mol del soluto en esa reaccion.',
      },
    );

    return {
      calculatorId: 'normality',
      solvedField: missingField,
      primaryResult: { label: 'Factor de equivalencia', value: resolved.equivalenceFactor, unit: 'n' },
      summary: buildSummary(resolved, equivalents),
      steps,
      interpretation: `El soluto trabaja con un factor de equivalencia igual a ${resolved.equivalenceFactor} en el proceso considerado.`,
      checks: [
        'En ejercicios reales, el factor suele venir dado por la reaccion quimica.',
        'Si el valor no es razonable, revisa unidades o el contexto reactivo.',
      ],
    };
  }

  const equivalents = (resolved.massSoluteGrams / resolved.molarMassGramsPerMol) * resolved.equivalenceFactor;
  resolved.solutionVolumeLiters = roundTo(equivalents / resolved.normalityEqPerL, 6);
  steps.push(
    {
      title: 'Calcular equivalentes',
      equation: `eq = (${resolved.massSoluteGrams} / ${resolved.molarMassGramsPerMol}) * ${resolved.equivalenceFactor} = ${roundTo(equivalents, 6)} eq`,
      explanation: 'Se determina la cantidad total de equivalentes presentes en la masa del soluto.',
    },
    {
      title: 'Despejar volumen',
      equation: `V = ${roundTo(equivalents, 6)} / ${resolved.normalityEqPerL} = ${resolved.solutionVolumeLiters} L`,
      explanation: 'El volumen final requerido se obtiene al dividir equivalentes totales por la normalidad objetivo.',
    },
  );

  return {
    calculatorId: 'normality',
    solvedField: missingField,
    primaryResult: { label: 'Volumen de solucion', value: resolved.solutionVolumeLiters, unit: 'L' },
    summary: buildSummary(resolved, equivalents),
    steps,
    interpretation: `Se necesita un volumen final de ${resolved.solutionVolumeLiters} L para alcanzar la normalidad indicada.`,
    checks: [
      'La normalidad depende del tipo de reaccion y del factor de equivalencia elegido.',
      'El volumen obtenido corresponde al volumen total de solucion.',
    ],
  };
}
