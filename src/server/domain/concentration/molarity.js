import { roundTo } from '../../utils/math.js';

function buildSummary(values, moles) {
  return [
    { label: 'Molaridad', value: roundTo(values.molarityMolPerL, 6), unit: 'mol/L' },
    { label: 'Masa de soluto', value: roundTo(values.massSoluteGrams, 6), unit: 'g' },
    { label: 'Masa molar', value: roundTo(values.molarMassGramsPerMol, 6), unit: 'g/mol' },
    { label: 'Volumen de solucion', value: roundTo(values.solutionVolumeLiters, 6), unit: 'L' },
    { label: 'Moles calculados', value: roundTo(moles, 6), unit: 'mol' },
  ];
}

export function solveMolarity(values, missingField) {
  const resolved = { ...values };
  const steps = [
    {
      title: 'Modelo aplicable',
      equation: 'M = n / V y n = m / MM',
      explanation: 'La molaridad relaciona los moles de soluto con el volumen total de solucion.',
    },
  ];

  if (missingField === 'molarityMolPerL') {
    const moles = resolved.massSoluteGrams / resolved.molarMassGramsPerMol;
    resolved.molarityMolPerL = roundTo(moles / resolved.solutionVolumeLiters, 6);
    steps.push(
      {
        title: 'Conversion de masa a moles',
        equation: `n = ${resolved.massSoluteGrams} / ${resolved.molarMassGramsPerMol} = ${roundTo(moles, 6)} mol`,
        explanation: 'Se transforma la masa del soluto en cantidad de sustancia usando la masa molar.',
      },
      {
        title: 'Calculo de molaridad',
        equation: `M = ${roundTo(moles, 6)} / ${resolved.solutionVolumeLiters} = ${resolved.molarityMolPerL} mol/L`,
        explanation: 'La concentracion molar queda expresada en moles por litro.',
      },
    );

    return {
      calculatorId: 'molarity',
      solvedField: missingField,
      primaryResult: { label: 'Molaridad calculada', value: resolved.molarityMolPerL, unit: 'mol/L' },
      summary: buildSummary(resolved, moles),
      steps,
      interpretation: `La solucion contiene ${resolved.molarityMolPerL} moles de soluto por cada litro de solucion.`,
      checks: [
        'La masa molar y la masa del soluto se mantuvieron en g y g/mol.',
        'El volumen se interpreto directamente en litros para evitar errores de conversion.',
      ],
    };
  }

  if (missingField === 'massSoluteGrams') {
    const moles = resolved.molarityMolPerL * resolved.solutionVolumeLiters;
    resolved.massSoluteGrams = roundTo(moles * resolved.molarMassGramsPerMol, 6);
    steps.push(
      {
        title: 'Moles requeridos',
        equation: `n = ${resolved.molarityMolPerL} * ${resolved.solutionVolumeLiters} = ${roundTo(moles, 6)} mol`,
        explanation: 'Primero se determina cuanta sustancia se necesita para la molaridad objetivo.',
      },
      {
        title: 'Conversion a masa',
        equation: `m = ${roundTo(moles, 6)} * ${resolved.molarMassGramsPerMol} = ${resolved.massSoluteGrams} g`,
        explanation: 'La masa final depende tanto de la cantidad de moles como de la masa molar del soluto.',
      },
    );

    return {
      calculatorId: 'molarity',
      solvedField: missingField,
      primaryResult: { label: 'Masa de soluto', value: resolved.massSoluteGrams, unit: 'g' },
      summary: buildSummary(resolved, moles),
      steps,
      interpretation: `Debes pesar ${resolved.massSoluteGrams} g de soluto para preparar la solucion deseada.`,
      checks: [
        'La masa molar se uso como factor de conversion entre mol y g.',
        'El volumen se considero volumen final de solucion, no solo de solvente.',
      ],
    };
  }

  if (missingField === 'molarMassGramsPerMol') {
    const moles = resolved.molarityMolPerL * resolved.solutionVolumeLiters;
    resolved.molarMassGramsPerMol = roundTo(resolved.massSoluteGrams / moles, 6);
    steps.push(
      {
        title: 'Moles presentes',
        equation: `n = ${resolved.molarityMolPerL} * ${resolved.solutionVolumeLiters} = ${roundTo(moles, 6)} mol`,
        explanation: 'La molaridad y el volumen permiten recuperar la cantidad de sustancia.',
      },
      {
        title: 'Despeje de masa molar',
        equation: `MM = ${resolved.massSoluteGrams} / ${roundTo(moles, 6)} = ${resolved.molarMassGramsPerMol} g/mol`,
        explanation: 'La masa molar se obtiene dividiendo la masa total por los moles presentes.',
      },
    );

    return {
      calculatorId: 'molarity',
      solvedField: missingField,
      primaryResult: { label: 'Masa molar', value: resolved.molarMassGramsPerMol, unit: 'g/mol' },
      summary: buildSummary(resolved, moles),
      steps,
      interpretation: `El compuesto analizado presenta una masa molar estimada de ${resolved.molarMassGramsPerMol} g/mol.`,
      checks: [
        'El resultado solo es valido si la solucion fue preparada con un unico soluto dominante.',
        'La molaridad se trato en mol/L para conservar consistencia dimensional.',
      ],
    };
  }

  const moles = resolved.massSoluteGrams / resolved.molarMassGramsPerMol;
  resolved.solutionVolumeLiters = roundTo(moles / resolved.molarityMolPerL, 6);
  steps.push(
    {
      title: 'Conversion de masa a moles',
      equation: `n = ${resolved.massSoluteGrams} / ${resolved.molarMassGramsPerMol} = ${roundTo(moles, 6)} mol`,
      explanation: 'La cantidad de sustancia se calcula antes de despejar el volumen.',
    },
    {
      title: 'Despeje de volumen',
      equation: `V = ${roundTo(moles, 6)} / ${resolved.molarityMolPerL} = ${resolved.solutionVolumeLiters} L`,
      explanation: 'El volumen corresponde al volumen final de solucion necesario para alcanzar la molaridad objetivo.',
    },
  );

  return {
    calculatorId: 'molarity',
    solvedField: missingField,
    primaryResult: { label: 'Volumen de solucion', value: resolved.solutionVolumeLiters, unit: 'L' },
    summary: buildSummary(resolved, moles),
    steps,
    interpretation: `Se requiere un volumen final de ${resolved.solutionVolumeLiters} L para obtener la concentracion indicada.`,
    checks: [
      'La relacion M = n/V usa siempre el volumen total de solucion.',
      'Si el procedimiento real usa mL, primero debes convertirlos a litros.',
    ],
  };
}
