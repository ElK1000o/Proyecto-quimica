# Chemica Concentraciones

MVP full-stack para aprender y resolver unidades de concentracion con calculadoras seguras, explicacion guiada y base lista para escalar a un producto educativo completo.

## Arquitectura general

- Frontend SPA moderna servida por el mismo servidor para reducir complejidad operativa inicial.
- API JSON interna con rutas versionables, validacion estricta y protecciones OWASP basicas desde el arranque.
- Dominio matematico desacoplado de HTTP para que cada calculadora escale como modulo independiente.
- Contenido teorico y banco de ejercicios encapsulados como catalogos reutilizables.

## Estructura del proyecto

- `src/client`: interfaz, estilos y scripts del frontend.
- `src/server`: servidor HTTP, seguridad, validaciones, dominio y servicios.
- `tests`: pruebas unitarias e integracion basadas en el runner nativo de Node.
- `docs`: arquitectura, seguridad y roadmap.

## MVP implementado

- Landing moderna con narrativa de producto.
- Calculadoras operativas para `% m/m`, `Molaridad` y `Fraccion molar`.
- Resolucion paso a paso con resumen, chequeos y exportacion a TXT.
- Modulo de ejercicios resueltos paso a paso.
- Seguridad base: CSP, CSRF, rate limiting, validacion de payloads, bloqueo de path traversal y errores controlados.

## Arranque local

```bash
node src/server/server.js
```

Abrir `http://127.0.0.1:3000`.

## Ejecutar tests

```bash
node tests/run-tests.js
```

## Nota sobre tests

- 
ode tests/run-tests.js ejecuta la validacion compatible con entornos restringidos.
- 
ode --test se mantiene disponible en 	ests/api y 	ests/domain para entornos sin restricciones de sandbox.

## Roadmap de la siguiente fase

- Agregar `% m/v`, `% v/v`, `ppm` y `normalidad` usando el mismo contrato.
- Incorporar generador adaptativo de ejercicios por dificultad.
- Introducir persistencia con PostgreSQL para historial, progreso y panel docente.
- Migrar a una capa de autenticacion segura con cookies HttpOnly y sesiones endurecidas.

