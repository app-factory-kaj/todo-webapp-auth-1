// window._env_ for mock mode — exactly the keys src/env.ts declares, and
// nothing else. A sibling API address is never here: todo-api is same-origin
// /api (handlers.ts via MSW), never a browser key.
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  // OIDC scopes are `group`/`ou`, singular, plus the project's own catalog
  // handles — exactly as the platform requests them.
  USER_AUTH_SCOPES: "openid profile email group ou todos:read todos:write",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};
