export const calculatorCatalog = [
  {
    id: 'mass-mass',
    shortLabel: '% m/m',
    title: 'Porcentaje masa / masa',
    tagline: 'Controla formulaciones solido-liquido y composiciones gravimetricas.',
    formula: '% m/m = (masa de soluto / masa de solucion) * 100',
    description:
      'Ideal para soluciones donde tanto el soluto como la mezcla completa se expresan en masa. Puedes calcular la concentracion, la masa de soluto o la masa total.',
    learning:
      'Usala cuando el enunciado entregue masas y quieras expresar composicion relativa sin depender del volumen.',
    fields: [
      {
        name: 'soluteMassGrams',
        label: 'Masa de soluto',
        placeholder: '12.5',
        unit: 'g',
      },
      {
        name: 'solutionMassGrams',
        label: 'Masa de solucion',
        placeholder: '250',
        unit: 'g',
      },
      {
        name: 'percent',
        label: 'Concentracion',
        placeholder: '5',
        unit: '% m/m',
      },
    ],
    theory: {
      definition: 'Compara la masa del soluto con la masa total de la solucion.',
      useCase: 'Preparacion de pomadas, aleaciones, soluciones salinas concentradas y formulaciones de laboratorio.',
      commonMistake: 'Confundir masa de solucion con masa de solvente o usar valores en distintas unidades.',
    },
  },
  {
    id: 'molarity',
    shortLabel: 'M',
    title: 'Molaridad',
    tagline: 'Prepara soluciones con base estequiometrica y control de moles.',
    formula: 'M = n / V y n = m / MM',
    description:
      'La calculadora resuelve molaridad, masa de soluto, masa molar o volumen final de solucion usando una cadena dimensional coherente.',
    learning:
      'Usala cuando el problema hable de moles por litro, preparacion de soluciones o reacciones en fase liquida.',
    fields: [
      {
        name: 'molarityMolPerL',
        label: 'Molaridad',
        placeholder: '0.5',
        unit: 'mol/L',
      },
      {
        name: 'massSoluteGrams',
        label: 'Masa de soluto',
        placeholder: '24.5',
        unit: 'g',
      },
      {
        name: 'molarMassGramsPerMol',
        label: 'Masa molar',
        placeholder: '58.44',
        unit: 'g/mol',
      },
      {
        name: 'solutionVolumeLiters',
        label: 'Volumen de solucion',
        placeholder: '1',
        unit: 'L',
      },
    ],
    theory: {
      definition: 'Relaciona los moles de soluto con el volumen total de la solucion en litros.',
      useCase: 'Preparacion de reactivos, titulaciones y calculos estequiometricos en solucion acuosa.',
      commonMistake: 'Usar mL sin convertir a L o calcular con masa en vez de moles.',
    },
  },
  {
    id: 'mole-fraction',
    shortLabel: 'X',
    title: 'Fraccion molar',
    tagline: 'Describe la composicion relativa de mezclas desde una perspectiva molecular.',
    formula: 'X_i = n_i / (n_i + n_j)',
    description:
      'Resuelve sistemas binarios y permite calcular la fraccion molar o la cantidad de moles faltante en el componente de interes.',
    learning:
      'Usala cuando el problema pide composicion de mezcla independiente de la temperatura y del volumen.',
    fields: [
      {
        name: 'moleFraction',
        label: 'Fraccion molar del componente',
        placeholder: '0.35',
        unit: 'X',
      },
      {
        name: 'molesComponent',
        label: 'Moles del componente',
        placeholder: '1.2',
        unit: 'mol',
      },
      {
        name: 'molesOther',
        label: 'Moles del resto de la mezcla',
        placeholder: '2.3',
        unit: 'mol',
      },
    ],
    theory: {
      definition: 'Expresa la proporcion de un componente respecto al total de moles del sistema.',
      useCase: 'Mezclas de gases, soluciones ideales y diagramas de equilibrio.',
      commonMistake: 'Olvidar sumar los moles totales o usar masa en lugar de cantidad de sustancia.',
    },
  },
];
