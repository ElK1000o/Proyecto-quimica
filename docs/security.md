# Seguridad y checklist OWASP

## Medidas aplicadas en el MVP

- Content Security Policy estricta con recursos solo same-origin.
- `X-Frame-Options: DENY` y `frame-ancestors 'none'` contra clickjacking.
- `X-Content-Type-Options: nosniff` para endurecer el manejo de tipos.
- `Referrer-Policy: no-referrer` y `Permissions-Policy` restrictiva.
- Rate limiting por IP para reducir abuso automatizado.
- Validacion estricta de cuerpos JSON y rechazo de campos no esperados.
- Proteccion CSRF para operaciones mutables mediante comprobacion de origen y token.
- Bloqueo de path traversal al resolver archivos estaticos.
- Manejo de errores sin exponer trazas internas en produccion.
- Sin `eval`, `exec`, shelling-out ni deserializacion insegura.

## Riesgos mitigados

- XSS: la UI no renderiza HTML del usuario y el contenido dinamico se escapa antes de insertarse.
- CSRF: los POST requieren `Origin` valido y `x-csrf-token` asociado a cookie.
- SSRF: el backend no realiza llamadas salientes basadas en entrada del usuario.
- SQL injection: el MVP no usa base de datos; cuando se agregue persistencia, se deben usar consultas parametrizadas.
- Command injection: no se ejecutan comandos del sistema operativo desde la aplicacion web.
- Path traversal: las rutas de archivos se normalizan y se comprueba que permanezcan dentro del directorio publico.
- Open redirect: no se implementan redirecciones controladas por el usuario.

## Buenas practicas de despliegue seguro

- Ejecutar detras de HTTPS y reverse proxy endurecido.
- Forzar `NODE_ENV=production` y `ALLOWED_ORIGIN` explicito.
- Mantener secretos fuera del codigo y de la imagen del contenedor.
- Registrar eventos de seguridad y errores de aplicacion en un colector centralizado.
- Ejecutar el proceso con usuario no privilegiado.
- Auditar dependencias cuando el proyecto evolucione a un stack con librerias externas.

## Nota importante

Una aplicacion web no puede eliminar todas las vulnerabilidades del sistema operativo anfitrion. Lo correcto es disenar el sistema para no depender de privilegios elevados, minimizar interacciones peligrosas con el SO, aislar procesos y endurecer despliegue e infraestructura.

## Tests recomendados para siguientes fases

- Tests de validacion por limites y formatos maliciosos.
- Integracion con futuras rutas autenticadas.
- DAST ligero sobre endpoints publicos.
- Analisis SAST y linting de seguridad en CI.
- Pruebas de cabeceras y CSP en pipeline.
