export function parseCookies(headerValue = '') {
  return headerValue
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((accumulator, pair) => {
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = decodeURIComponent(pair.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(pair.slice(separatorIndex + 1).trim());
      accumulator[key] = value;
      return accumulator;
    }, {});
}

export function serializeCookie(name, value, options = {}) {
  const attributes = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge) {
    attributes.push(`Max-Age=${options.maxAge}`);
  }
  if (options.path) {
    attributes.push(`Path=${options.path}`);
  }
  if (options.sameSite) {
    attributes.push(`SameSite=${options.sameSite}`);
  }
  if (options.secure) {
    attributes.push('Secure');
  }
  if (options.httpOnly) {
    attributes.push('HttpOnly');
  }

  return attributes.join('; ');
}
