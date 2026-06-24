# Concentraciones Químicas

Plataforma web para aprender y resolver ejercicios de **unidades de concentración en química**. Permite calcular, entender la teoría y practicar con ejercicios paso a paso, sin necesidad de instalar nada más que un navegador.

🔗 Repositorio: https://github.com/ElK1000o/Proyecto-quimica

## ¿De qué trata este proyecto?

Este proyecto fue desarrollado para el trabajo aplicado del **Tema 5: Unidades de concentración**, de la asignatura **Química Aplicada a la Ingeniería (NQBT1003)**, dictada por la profesora **Marcela Vivanco Millares** en la **Universidad Mayor**.

La idea nace de una dificultad habitual en el curso: muchas veces el estudiante reconoce una fórmula, pero no siempre identifica con claridad qué tipo de concentración corresponde a cada problema, cómo interpretar los datos entregados o cómo desarrollar el ejercicio paso a paso. Por eso, en vez de entregar solo un documento con fórmulas, el equipo construyó una herramienta interactiva donde se puede practicar, calcular y revisar el procedimiento completo de cada ejercicio.

## ¿Qué hace la plataforma?

- **7 calculadoras**, una por cada unidad pedida en el Tema 5: porcentaje masa/masa (% m/m), porcentaje masa/volumen (% m/v), porcentaje volumen/volumen (% v/v), partes por millón (ppm), molaridad, normalidad y fracción molar.
- **Resolución guiada paso a paso**: el usuario deja un solo dato vacío y la plataforma calcula esa variable, mostrando el desarrollo completo (fórmula, sustitución, resultado e interpretación), igual a como se resolvería en clases o en una prueba.
- **Teoría de cada unidad**: qué es, cuándo usarla, cuándo no, en qué se diferencia de las demás y cuáles son los errores más comunes al aplicarla.
- **Banco de 14 ejercicios resueltos**, dos por cada unidad, con el procedimiento completo explicado.
- **Generador de ejercicios de práctica**, con distintos niveles de dificultad y dos modos de uso: *modo estudio* (muestra la resolución completa) y *modo examen* (primero se intenta resolver y luego se revela la solución).
- **Convertidor de unidades** (masa, volumen, cantidad de sustancia y concentraciones diluidas), útil para preparar los datos antes de calcular.
- Interfaz con tema claro/oscuro y diseño pensado para leerse cómodamente desde el computador o el celular.

## Cómo ver la plataforma funcionando

El proyecto corre con [Node.js](https://nodejs.org/) (versión 22 o superior) y no necesita instalar librerías externas ni bases de datos.

```bash
node src/server/server.js
```

Luego se abre en el navegador: `http://127.0.0.1:3000`

Para correr las pruebas automáticas que validan que todas las calculadoras entreguen el resultado correcto:

```bash
npm test
```

## Estructura del proyecto

- `src/client`: lo que ve el usuario en el navegador (la página, los estilos y la interacción de cada calculadora).
- `src/server`: la lógica detrás de cada cálculo, la validación de los datos ingresados y la seguridad del sitio.
- `tests`: pruebas que verifican que cada calculadora entregue el resultado matemático correcto.
- `docs`: documentación adicional del proyecto, incluyendo la propuesta de trabajo original, la arquitectura técnica (`architecture.md`) y las medidas de seguridad aplicadas (`security.md`).

## Equipo de trabajo

Trabajo desarrollado para la asignatura **Química Aplicada a la Ingeniería (NQBT1003)** — Universidad Mayor.

- Cristiann Calderon
- Matias Catalans
- Vicente Farías
- Lukas González
- Camilo Riquelme
- Ivan Rubilar

**Profesora a cargo:** Marcela Vivanco Millares
