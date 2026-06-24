import http from 'node:http';

import { config, isProduction } from './config.js';
import { createApp } from './app.js';

if (isProduction() && !config.allowedOrigin) {
  console.warn(
    '[seguridad] ALLOWED_ORIGIN no esta configurado en produccion. El origen esperado se inferira de la peticion, lo que puede causar el error "Origen no permitido para solicitudes mutables" si el sitio se sirve detras de HTTPS o un proxy. Define ALLOWED_ORIGIN=https://tu-dominio explicitamente.',
  );
}

const server = http.createServer(createApp());

server.listen(config.port, config.host, () => {
  console.log(`Concentraciones Quimicas disponible en http://${config.host}:${config.port}`);
});

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.error(
      `El puerto ${config.port} ya esta en uso. Cierra la instancia anterior o inicia con otro puerto, por ejemplo PORT=3100.`,
    );
    process.exitCode = 1;
    return;
  }

  console.error(error);
  process.exitCode = 1;
});
