// Typed read of window._env_, the platform's runtime config. Mounted via
// /env-config.js at request time — never build-time (.env, import.meta.env.VITE_*
// all arrive undefined in production). Declares only the keys this app actually
// has: the user-auth OIDC config. Sibling API addresses are never here — the
// todo-api client reaches it at same-origin /api (see src/api.ts).
type Env = {
  // user-auth (Thunder) OIDC config. All four are required — RESOURCE especially:
  // without it the token's `aud` is wrong and every /api call 401s even though
  // sign-in looks healthy. <DEP>_JWKS_URL is emitted too, but the browser never
  // validates a token (the API gateway does), so it is not declared here.
  USER_AUTH_CLIENT_ID: string;
  USER_AUTH_ISSUER: string;
  USER_AUTH_SCOPES: string;
  USER_AUTH_RESOURCE: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
