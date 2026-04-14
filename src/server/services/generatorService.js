import { calculate } from './calculationEngine.js';
import { getCalculatorById } from './studyContentService.js';

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDecimal(min, max, precision = 1) {
  const factor = 10 ** precision;
  return randInt(min * factor, max * factor) / factor;
}

const takeaways = {
  'mass-mass': 'Verifica siempre si el problema te da masa total de solucion o masa de solvente por separado.',
  'mass-volume': 'Recuerda que el volumen usado en % m/v es el volumen final de la solucion.',
  'volume-volume': 'En % v/v debes trabajar con volumenes de la misma unidad y con volumen final de mezcla.',
  ppm: 'La lectura ppm ~= mg/L se interpreta de forma segura en soluciones acuosas diluidas.',
  molarity: 'En molaridad toda conversion entre gramos y moles pasa por la masa molar.',
  normality: 'La normalidad depende del factor de equivalencia definido por la reaccion.',
  'mole-fraction': 'La fraccion molar siempre se calcula sobre el total de moles presentes.',
};

function buildPrompt(unit, difficulty, values) {
  if (unit === 'mass-mass' && difficulty === 'basico') {
    return {
      title: 'Porcentaje de una mezcla solida',
      prompt: `Una solucion contiene ${values.soluteMassGrams} g de soluto y ${values.solutionMassGrams} g de solucion total. Calcula el porcentaje masa/masa.`,
      payload: { soluteMassGrams: values.soluteMassGrams, solutionMassGrams: values.solutionMassGrams, percent: '' },
    };
  }

  if (unit === 'mass-mass' && difficulty === 'intermedio') {
    return {
      title: 'Masa de soluto requerida',
      prompt: `Se quiere preparar ${values.solutionMassGrams} g de solucion al ${values.percent}% m/m. Calcula la masa de soluto.`,
      payload: { soluteMassGrams: '', solutionMassGrams: values.solutionMassGrams, percent: values.percent },
    };
  }

  if (unit === 'mass-mass') {
    return {
      title: 'Masa total de solucion',
      prompt: `Una mezcla contiene ${values.soluteMassGrams} g de soluto y su concentracion es ${values.percent}% m/m. Calcula la masa total de la solucion.`,
      payload: { soluteMassGrams: values.soluteMassGrams, solutionMassGrams: '', percent: values.percent },
    };
  }

  if (unit === 'mass-volume' && difficulty === 'basico') {
    return {
      title: 'Concentracion en solucion acuosa',
      prompt: `Se disuelven ${values.soluteMassGrams} g de soluto hasta completar ${values.solutionVolumeMilliliters} mL de solucion. Calcula el % m/v.`,
      payload: { soluteMassGrams: values.soluteMassGrams, solutionVolumeMilliliters: values.solutionVolumeMilliliters, percent: '' },
    };
  }

  if (unit === 'mass-volume' && difficulty === 'intermedio') {
    return {
      title: 'Masa necesaria para una solucion',
      prompt: `Cuantos gramos de soluto se necesitan para preparar ${values.solutionVolumeMilliliters} mL de solucion al ${values.percent}% m/v?`,
      payload: { soluteMassGrams: '', solutionVolumeMilliliters: values.solutionVolumeMilliliters, percent: values.percent },
    };
  }

  if (unit === 'mass-volume') {
    return {
      title: 'Volumen final de solucion',
      prompt: `Una solucion contiene ${values.soluteMassGrams} g de soluto y tiene concentracion ${values.percent}% m/v. Calcula el volumen final de la solucion.`,
      payload: { soluteMassGrams: values.soluteMassGrams, solutionVolumeMilliliters: '', percent: values.percent },
    };
  }

  if (unit === 'volume-volume' && difficulty === 'basico') {
    return {
      title: 'Mezcla liquida',
      prompt: `Una mezcla contiene ${values.soluteVolumeMilliliters} mL de soluto en ${values.solutionVolumeMilliliters} mL de solucion. Calcula el % v/v.`,
      payload: { soluteVolumeMilliliters: values.soluteVolumeMilliliters, solutionVolumeMilliliters: values.solutionVolumeMilliliters, percent: '' },
    };
  }

  if (unit === 'volume-volume' && difficulty === 'intermedio') {
    return {
      title: 'Volumen de un componente',
      prompt: `Cuantos mL de soluto se necesitan para preparar ${values.solutionVolumeMilliliters} mL de una mezcla al ${values.percent}% v/v?`,
      payload: { soluteVolumeMilliliters: '', solutionVolumeMilliliters: values.solutionVolumeMilliliters, percent: values.percent },
    };
  }

  if (unit === 'volume-volume') {
    return {
      title: 'Volumen total de mezcla',
      prompt: `Una mezcla contiene ${values.soluteVolumeMilliliters} mL de soluto y su concentracion es ${values.percent}% v/v. Calcula el volumen total de la solucion.`,
      payload: { soluteVolumeMilliliters: values.soluteVolumeMilliliters, solutionVolumeMilliliters: '', percent: values.percent },
    };
  }

  if (unit === 'ppm' && difficulty === 'basico') {
    return {
      title: 'Analisis de agua',
      prompt: `Una muestra contiene ${values.soluteMassMilligrams} mg de soluto en ${values.solutionVolumeLiters} L. Calcula la concentracion en ppm.`,
      payload: { soluteMassMilligrams: values.soluteMassMilligrams, solutionVolumeLiters: values.solutionVolumeLiters, ppm: '' },
    };
  }

  if (unit === 'ppm' && difficulty === 'intermedio') {
    return {
      title: 'Masa a partir de ppm',
      prompt: `Cuantos mg de soluto hay en ${values.solutionVolumeLiters} L de una solucion de ${values.ppm} ppm?`,
      payload: { soluteMassMilligrams: '', solutionVolumeLiters: values.solutionVolumeLiters, ppm: values.ppm },
    };
  }

  if (unit === 'ppm') {
    return {
      title: 'Volumen a partir de ppm',
      prompt: `Una muestra contiene ${values.soluteMassMilligrams} mg de soluto y su concentracion es ${values.ppm} ppm. Calcula el volumen de la solucion.`,
      payload: { soluteMassMilligrams: values.soluteMassMilligrams, solutionVolumeLiters: '', ppm: values.ppm },
    };
  }

  if (unit === 'molarity' && difficulty === 'basico') {
    return {
      title: 'Molaridad de una solucion',
      prompt: `Calcula la molaridad de una solucion preparada con ${values.massSoluteGrams} g de soluto en ${values.solutionVolumeLiters} L. Usa masa molar ${values.molarMassGramsPerMol} g/mol.`,
      payload: {
        molarityMolPerL: '',
        massSoluteGrams: values.massSoluteGrams,
        molarMassGramsPerMol: values.molarMassGramsPerMol,
        solutionVolumeLiters: values.solutionVolumeLiters,
      },
    };
  }

  if (unit === 'molarity' && difficulty === 'intermedio') {
    return {
      title: 'Preparacion de solucion molar',
      prompt: `Cuantos gramos de soluto necesitas para preparar ${values.solutionVolumeLiters} L de solucion ${values.molarityMolPerL} M si la masa molar es ${values.molarMassGramsPerMol} g/mol?`,
      payload: {
        molarityMolPerL: values.molarityMolPerL,
        massSoluteGrams: '',
        molarMassGramsPerMol: values.molarMassGramsPerMol,
        solutionVolumeLiters: values.solutionVolumeLiters,
      },
    };
  }

  if (unit === 'molarity') {
    return {
      title: 'Volumen final para una molaridad dada',
      prompt: `Una muestra contiene ${values.massSoluteGrams} g de soluto de masa molar ${values.molarMassGramsPerMol} g/mol. Si la solucion debe quedar a ${values.molarityMolPerL} M, calcula el volumen final.`,
      payload: {
        molarityMolPerL: values.molarityMolPerL,
        massSoluteGrams: values.massSoluteGrams,
        molarMassGramsPerMol: values.molarMassGramsPerMol,
        solutionVolumeLiters: '',
      },
    };
  }

  if (unit === 'normality' && difficulty === 'basico') {
    return {
      title: 'Normalidad de una solucion',
      prompt: `Calcula la normalidad de una solucion preparada con ${values.massSoluteGrams} g de soluto en ${values.solutionVolumeLiters} L. Usa masa molar ${values.molarMassGramsPerMol} g/mol y factor ${values.equivalenceFactor}.`,
      payload: {
        normalityEqPerL: '',
        massSoluteGrams: values.massSoluteGrams,
        molarMassGramsPerMol: values.molarMassGramsPerMol,
        equivalenceFactor: values.equivalenceFactor,
        solutionVolumeLiters: values.solutionVolumeLiters,
      },
    };
  }

  if (unit === 'normality' && difficulty === 'intermedio') {
    return {
      title: 'Masa para una solucion normal',
      prompt: `Cuantos gramos de soluto se requieren para preparar ${values.solutionVolumeLiters} L de solucion ${values.normalityEqPerL} N? Usa masa molar ${values.molarMassGramsPerMol} g/mol y factor ${values.equivalenceFactor}.`,
      payload: {
        normalityEqPerL: values.normalityEqPerL,
        massSoluteGrams: '',
        molarMassGramsPerMol: values.molarMassGramsPerMol,
        equivalenceFactor: values.equivalenceFactor,
        solutionVolumeLiters: values.solutionVolumeLiters,
      },
    };
  }

  if (unit === 'normality') {
    return {
      title: 'Volumen a partir de normalidad',
      prompt: `Una muestra contiene ${values.massSoluteGrams} g de soluto de masa molar ${values.molarMassGramsPerMol} g/mol y factor ${values.equivalenceFactor}. Si la solucion debe quedar a ${values.normalityEqPerL} N, calcula el volumen final.`,
      payload: {
        normalityEqPerL: values.normalityEqPerL,
        massSoluteGrams: values.massSoluteGrams,
        molarMassGramsPerMol: values.molarMassGramsPerMol,
        equivalenceFactor: values.equivalenceFactor,
        solutionVolumeLiters: '',
      },
    };
  }

  if (unit === 'mole-fraction' && difficulty === 'basico') {
    return {
      title: 'Composicion de una mezcla',
      prompt: `Una mezcla binaria contiene ${values.molesComponent} mol del componente de interes y ${values.molesOther} mol del otro componente. Calcula la fraccion molar del primero.`,
      payload: { moleFraction: '', molesComponent: values.molesComponent, molesOther: values.molesOther },
    };
  }

  if (unit === 'mole-fraction' && difficulty === 'intermedio') {
    return {
      title: 'Moles del componente principal',
      prompt: `Una mezcla binaria tiene fraccion molar ${values.moleFraction} para el componente de interes y contiene ${values.molesOther} mol del otro componente. Calcula los moles del componente de interes.`,
      payload: { moleFraction: values.moleFraction, molesComponent: '', molesOther: values.molesOther },
    };
  }

  return {
    title: 'Moles del segundo componente',
    prompt: `Una mezcla binaria tiene fraccion molar ${values.moleFraction} para el componente de interes y contiene ${values.molesComponent} mol de dicho componente. Calcula los moles del resto de la mezcla.`,
    payload: { moleFraction: values.moleFraction, molesComponent: values.molesComponent, molesOther: '' },
  };
}

function buildValues(unit, difficulty) {
  if (unit === 'mass-mass') {
    return difficulty === 'basico'
      ? { soluteMassGrams: randInt(8, 30), solutionMassGrams: randInt(80, 250) }
      : difficulty === 'intermedio'
        ? { percent: randInt(4, 20), solutionMassGrams: randInt(100, 500) }
        : { soluteMassGrams: randInt(10, 60), percent: randInt(5, 25) };
  }

  if (unit === 'mass-volume') {
    return difficulty === 'basico'
      ? { soluteMassGrams: randDecimal(2, 12, 1), solutionVolumeMilliliters: randInt(100, 500) }
      : difficulty === 'intermedio'
        ? { percent: randDecimal(0.5, 12, 1), solutionVolumeMilliliters: randInt(100, 800) }
        : { soluteMassGrams: randDecimal(1, 15, 1), percent: randDecimal(0.5, 10, 1) };
  }

  if (unit === 'volume-volume') {
    return difficulty === 'basico'
      ? { soluteVolumeMilliliters: randInt(10, 80), solutionVolumeMilliliters: randInt(100, 300) }
      : difficulty === 'intermedio'
        ? { percent: randInt(5, 40), solutionVolumeMilliliters: randInt(100, 500) }
        : { soluteVolumeMilliliters: randInt(10, 120), percent: randInt(5, 40) };
  }

  if (unit === 'ppm') {
    return difficulty === 'basico'
      ? { soluteMassMilligrams: randDecimal(0.5, 8, 1), solutionVolumeLiters: randDecimal(1, 5, 1) }
      : difficulty === 'intermedio'
        ? { ppm: randDecimal(0.5, 5, 1), solutionVolumeLiters: randDecimal(1, 6, 1) }
        : { soluteMassMilligrams: randDecimal(1, 12, 1), ppm: randDecimal(0.5, 5, 1) };
  }

  if (unit === 'molarity') {
    return difficulty === 'basico'
      ? { massSoluteGrams: randDecimal(5, 30, 2), molarMassGramsPerMol: randDecimal(40, 120, 2), solutionVolumeLiters: randDecimal(0.5, 2, 2) }
      : difficulty === 'intermedio'
        ? { molarityMolPerL: randDecimal(0.1, 2, 2), molarMassGramsPerMol: randDecimal(36, 180, 2), solutionVolumeLiters: randDecimal(0.25, 2, 2) }
        : { massSoluteGrams: randDecimal(5, 35, 2), molarMassGramsPerMol: randDecimal(40, 160, 2), molarityMolPerL: randDecimal(0.1, 1.5, 2) };
  }

  if (unit === 'normality') {
    return difficulty === 'basico'
      ? { massSoluteGrams: randDecimal(4, 40, 2), molarMassGramsPerMol: randDecimal(40, 120, 2), equivalenceFactor: randInt(1, 3), solutionVolumeLiters: randDecimal(0.5, 2, 2) }
      : difficulty === 'intermedio'
        ? { normalityEqPerL: randDecimal(0.1, 2, 2), molarMassGramsPerMol: randDecimal(40, 150, 2), equivalenceFactor: randInt(1, 3), solutionVolumeLiters: randDecimal(0.25, 2, 2) }
        : { massSoluteGrams: randDecimal(5, 45, 2), molarMassGramsPerMol: randDecimal(40, 150, 2), equivalenceFactor: randInt(1, 4), normalityEqPerL: randDecimal(0.1, 2, 2) };
  }

  return difficulty === 'basico'
    ? { molesComponent: randDecimal(0.5, 4, 1), molesOther: randDecimal(0.5, 6, 1) }
    : difficulty === 'intermedio'
      ? { moleFraction: randDecimal(0.1, 0.7, 2), molesOther: randDecimal(1, 8, 1) }
      : { moleFraction: randDecimal(0.1, 0.8, 2), molesComponent: randDecimal(0.5, 5, 1) };
}

export function generateExercise({ unit = 'all', difficulty = 'basico' }) {
  const availableUnits = [
    'mass-mass',
    'mass-volume',
    'volume-volume',
    'ppm',
    'molarity',
    'normality',
    'mole-fraction',
  ];
  const selectedUnit = unit === 'all' ? availableUnits[randInt(0, availableUnits.length - 1)] : unit;
  const selectedDifficulty = ['basico', 'intermedio', 'avanzado'].includes(difficulty) ? difficulty : 'basico';
  const calculator = getCalculatorById(selectedUnit);
  const values = buildValues(selectedUnit, selectedDifficulty);
  const baseExercise = buildPrompt(selectedUnit, selectedDifficulty, values);
  const result = calculate(selectedUnit, baseExercise.payload);

  return {
    id: `gen-${selectedUnit}-${Date.now()}`,
    unit: selectedUnit,
    difficulty: selectedDifficulty,
    title: baseExercise.title,
    prompt: baseExercise.prompt,
    steps: result.steps,
    answer: `${result.primaryResult.label}: ${result.primaryResult.value} ${result.primaryResult.unit}`,
    takeaway: takeaways[selectedUnit],
    interpretation: result.interpretation,
    summary: result.summary,
    calculatorTitle: calculator?.title ?? selectedUnit,
  };
}
