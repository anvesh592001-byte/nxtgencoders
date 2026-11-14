// Server-side diagnostic logging for authentication and rate-limit events.
// Only categories and non-sensitive metadata are recorded — never passwords,
// access/refresh tokens, service-role keys, or other secrets. Output goes to
// the server function logs (Vercel) for production debugging.

type Details = Record<string, unknown>;

function stamp(details: Details): Details {
  return { ts: new Date().toISOString(), ...details };
}

export function logAuthFailure(operation: string, details: Details = {}) {
  console.warn("[auth-failure]", operation, stamp(details));
}

export function logSessionMissing(operation: string, details: Details = {}) {
  console.warn("[session-missing]", operation, stamp(details));
}

export function logRateLimit(operation: string, details: Details = {}) {
  console.warn("[rate-limit]", operation, stamp(details));
}
