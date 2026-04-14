export const exerciseBank = [
  {
    id: 'mm-01',
    unit: 'mass-mass',
    difficulty: 'basico',
    title: 'Salmuera al 12% m/m',
    prompt:
      'Una solucion contiene 18 g de NaCl y 132 g de agua. Calcula el porcentaje masa/masa de la solucion.',
    steps: [
      {
        title: '1. Identificar la magnitud pedida',
        explanation: 'Se solicita porcentaje masa/masa, por lo que necesitamos masa de soluto y masa total de solucion.',
      },
      {
        title: '2. Calcular la masa total',
        explanation: 'masa de solucion = 18 g + 132 g = 150 g',
      },
      {
        title: '3. Aplicar la formula',
        explanation: '% m/m = (18 g / 150 g) * 100 = 12%',
      },
      {
        title: '4. Interpretar',
        explanation: 'Cada 100 g de solucion contienen 12 g de NaCl.',
      },
    ],
    answer: 'La salmuera tiene una concentracion de 12% m/m.',
    takeaway: 'Cuando te den masa de solvente y soluto por separado, primero reconstruye la masa total de la solucion.',
  },
  {
    id: 'mm-02',
    unit: 'mass-mass',
    difficulty: 'intermedio',
    title: 'Jarabe concentrado',
    prompt:
      'Se desea preparar 250 g de un jarabe al 8% m/m de sacarosa. Determina la masa de sacarosa necesaria.',
    steps: [
      {
        title: '1. Datos relevantes',
        explanation: 'Conoces la masa total de solucion y la fraccion masica objetivo.',
      },
      {
        title: '2. Despejar la masa de soluto',
        explanation: 'masa de soluto = (8 / 100) * 250 g = 20 g',
      },
      {
        title: '3. Verificar coherencia',
        explanation: '20 g es menor que 250 g, por lo que la mezcla es fisicamente posible.',
      },
    ],
    answer: 'Se requieren 20 g de sacarosa.',
    takeaway: 'En formulacion, % m/m siempre se interpreta sobre la masa total de la solucion final.',
  },
  {
    id: 'molarity-01',
    unit: 'molarity',
    difficulty: 'basico',
    title: 'NaCl 0.5 M',
    prompt:
      'Calcula la molaridad de una solucion preparada con 29.22 g de NaCl en un volumen final de 1 L. Usa masa molar 58.44 g/mol.',
    steps: [
      {
        title: '1. Convertir masa a moles',
        explanation: 'n = 29.22 / 58.44 = 0.5 mol',
      },
      {
        title: '2. Aplicar la definicion de molaridad',
        explanation: 'M = 0.5 mol / 1 L = 0.5 mol/L',
      },
      {
        title: '3. Interpretar',
        explanation: 'La solucion contiene medio mol de NaCl por cada litro de solucion.',
      },
    ],
    answer: 'La molaridad es 0.5 M.',
    takeaway: 'Si el volumen final ya esta en litros, la conversion dimensional queda directa.',
  },
  {
    id: 'molarity-02',
    unit: 'molarity',
    difficulty: 'intermedio',
    title: 'Preparacion de HCl',
    prompt:
      'Cuantos gramos de HCl necesitas para preparar 750 mL de una solucion 0.20 M? Usa masa molar 36.46 g/mol.',
    steps: [
      {
        title: '1. Convertir volumen a litros',
        explanation: '750 mL = 0.750 L',
      },
      {
        title: '2. Calcular moles requeridos',
        explanation: 'n = 0.20 * 0.750 = 0.150 mol',
      },
      {
        title: '3. Convertir moles a masa',
        explanation: 'm = 0.150 * 36.46 = 5.469 g',
      },
    ],
    answer: 'Necesitas 5.469 g de HCl.',
    takeaway: 'El error mas comun en molaridad es olvidar pasar de mL a L antes de multiplicar.',
  },
  {
    id: 'x-01',
    unit: 'mole-fraction',
    difficulty: 'basico',
    title: 'Mezcla etanol-agua',
    prompt:
      'Una mezcla binaria contiene 2.0 mol de etanol y 3.0 mol de agua. Calcula la fraccion molar del etanol.',
    steps: [
      {
        title: '1. Sumar moles totales',
        explanation: 'n_total = 2.0 + 3.0 = 5.0 mol',
      },
      {
        title: '2. Aplicar la formula',
        explanation: 'X_etanol = 2.0 / 5.0 = 0.40',
      },
      {
        title: '3. Interpretar',
        explanation: 'El etanol representa el 40% de los moles totales de la mezcla.',
      },
    ],
    answer: 'La fraccion molar del etanol es 0.40.',
    takeaway: 'La fraccion molar no depende de la unidad de masa o volumen, solo de los moles.',
  },
  {
    id: 'x-02',
    unit: 'mole-fraction',
    difficulty: 'intermedio',
    title: 'Recuperar moles faltantes',
    prompt:
      'Una mezcla binaria tiene fraccion molar de acetona igual a 0.25 y contiene 6.0 mol del otro componente. Calcula los moles de acetona.',
    steps: [
      {
        title: '1. Elegir despeje correcto',
        explanation: 'n_i = (X_i * n_j) / (1 - X_i)',
      },
      {
        title: '2. Sustituir datos',
        explanation: 'n_i = (0.25 * 6.0) / (1 - 0.25) = 2.0 mol',
      },
      {
        title: '3. Verificar',
        explanation: '2.0 / (2.0 + 6.0) = 0.25, por lo tanto el resultado es consistente.',
      },
    ],
    answer: 'La mezcla contiene 2.0 mol de acetona.',
    takeaway: 'En problemas inversos de fraccion molar conviene despejar algebraicamente antes de sustituir.',
  },
];
