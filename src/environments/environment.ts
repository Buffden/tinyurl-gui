export const environment = {
  production: false,
  apiUrl: '/api'           // proxied via proxy.conf.json → tinyurl-nginx in Docker
                           // or via ng serve proxy when running locally without Docker
};
