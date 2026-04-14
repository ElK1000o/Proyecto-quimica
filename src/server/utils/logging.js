export function logSecurityEvent(event, context = {}) {
  const message = {
    level: 'warn',
    event,
    timestamp: new Date().toISOString(),
    context,
  };

  console.warn(JSON.stringify(message));
}
