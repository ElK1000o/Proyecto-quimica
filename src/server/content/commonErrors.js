export const commonErrors = [
  {
    title: 'Confundir solucion con solvente',
    detail: 'En varias unidades el denominador es la solucion completa, no solo el solvente agregado.',
    prevention: 'Antes de sustituir, escribe con palabras que representa cada magnitud.',
  },
  {
    title: 'No convertir mL a L',
    detail: 'Molaridad, normalidad y ppm suelen exigir litros en el denominador.',
    prevention: 'Haz la conversion de volumen antes de cualquier multiplicacion o division.',
  },
  {
    title: 'Mezclar masa con volumen sin criterio',
    detail: 'No toda unidad de concentracion usa el mismo tipo de magnitud en numerador y denominador.',
    prevention: 'Identifica primero si el problema trabaja con masa, volumen o moles.',
  },
  {
    title: 'Olvidar la masa molar',
    detail: 'En molaridad y normalidad no se puede pasar de gramos a moles sin masa molar.',
    prevention: 'Cada vez que aparezcan gramos y te pidan moles, busca inmediatamente la masa molar.',
  },
  {
    title: 'Aplicar ppm sin revisar la aproximacion',
    detail: 'La equivalencia ppm ~= mg/L es segura en soluciones acuosas diluidas, no en cualquier sistema.',
    prevention: 'Menciona la aproximacion usada al interpretar el resultado.',
  },
  {
    title: 'Ignorar el factor de equivalencia',
    detail: 'En normalidad, el mismo compuesto puede tener factores distintos segun la reaccion.',
    prevention: 'Relaciona la reaccion quimica con protones, electrones o cargas intercambiadas.',
  },
  {
    title: 'No sumar moles totales',
    detail: 'La fraccion molar se calcula sobre el total de moles presentes en el sistema.',
    prevention: 'Escribe n_total antes de calcular cualquier X_i.',
  },
  {
    title: 'Redondear demasiado pronto',
    detail: 'Redondear en pasos intermedios puede desplazar el resultado final.',
    prevention: 'Conserva varios decimales durante el procedimiento y redondea al final.',
  },
];
