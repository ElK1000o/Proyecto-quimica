# Arquitectura del sistema

## Vision general

El MVP se construyo como una plataforma educativa full-stack con una arquitectura por capas:

1. Presentacion: SPA moderna servida desde `src/client`.
2. Aplicacion: API HTTP interna que orquesta validacion, seguridad y serializacion.
3. Dominio: calculadoras quimicas puras y reutilizables.
4. Contenido: catalogo de unidades y banco de ejercicios independientes del render.

## Flujo principal

1. El cliente solicita catalogo y ejercicios iniciales.
2. El backend devuelve metadatos de unidades y contenido pedagogico reutilizable.
3. El usuario completa un formulario dejando una variable vacia.
4. La API valida payload, comprueba origen y CSRF, aplica rate limiting y despacha al solver correcto.
5. El solver devuelve resultado, pasos, resumen y chequeos de consistencia.
6. La UI renderiza el desarrollo paso a paso y permite copiar o exportar.

## Decisiones de arquitectura

### Frontend

- Se eligio una SPA ligera servida por el mismo backend para mantener el MVP operativo sin depender de build tooling externo.
- La interfaz usa componentes renderizados por funciones y un estado pequeno en memoria.
- La experiencia visual se diseno con tokens, temas claro/oscuro y cards reutilizables.

### Backend

- Servidor HTTP nativo de Node para minimizar dependencias y superficie de ataque.
- Rutas separadas de dominio y validacion para permitir futura migracion a Fastify, Next o FastAPI sin perder la logica quimica.
- Contrato JSON consistente para calculadoras y ejercicios.

### Escalabilidad

La expansion a nuevas unidades sigue un patron fijo:

1. Agregar un schema de validacion en `validators/calculationSchemas`.
2. Crear un solver puro en `src/server/domain/concentration` y registrarlo en `calculationEngine`.
3. Registrar la unidad en `content/calculators.js` (catalogo que consume `studyApi`).
4. Incorporar teoria y ejercicios al banco.

## Estructura profesional de carpetas

```text
src/
  client/
    index.html
    scripts/
    styles/
  server/
    app.js
    server.js
    config.js
    http/
    routes/
    services/
    validators/
    domain/
      concentration/
    content/
    utils/
tests/
  api/
  domain/
docs/
```

## Evolucion por fases

### MVP actual

- Landing premium
- 7 calculadoras: % m/m, % m/v, % v/v, ppm, molaridad, normalidad y fraccion molar
- Banco de ejercicios resueltos y generador de ejercicios aleatorios por dificultad (basico/intermedio)
- Conversor de unidades
- Modo estudio / modo examen
- Seguridad base
- Tests unitarios e integracion

### Version intermedia

- Historial local o persistente del progreso del usuario

### Version avanzada

- Autenticacion
- Banco editable de ejercicios
- Generador realmente adaptativo, ajustado al desempeno historico del usuario (el generador actual crea ejercicios aleatorios por dificultad, todavia no adapta segun resultados previos)
- Analitica de progreso
- Panel docente/admin
