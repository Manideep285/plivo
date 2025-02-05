export const auth0Config = {
  domain: process.env.VITE_AUTH0_DOMAIN || "",
  clientId: process.env.VITE_AUTH0_CLIENT_ID || "",
  audience: process.env.VITE_AUTH0_AUDIENCE || "",
  redirectUri: window.location.origin,
  scope: "openid profile email",
};
