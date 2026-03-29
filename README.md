# TinyURL GUI

Angular 19 frontend for the TinyURL service. Provides a UI for shortening URLs with QR code generation.

- **Live:** [tinyurl.buffden.com](https://tinyurl.buffden.com)
- **Backend API:** [go.buffden.com](https://go.buffden.com)

![Demo](docs/demo/tinyurl-demo.gif)

---

## Stack

- Angular 19 with SSR (`@angular/ssr`)
- Angular Material 19
- QR code generation (`angularx-qrcode`)

---

## Running Locally

### Dev server via Docker (recommended)

```bash
npm run start:docker
```

Runs the Angular dev server in a container with live reload. The backend Docker stack must already be running (start it from the repo root with `docker compose up`).

### Dev server (native)

```bash
npm install
npm start
```

App runs at `http://localhost:4200`. API calls are proxied to the backend Nginx container — requires the Docker stack to be running.

---

## Building

```bash
# Production build
npm run build

# Development build with watch
npm run build -- --watch --configuration development
```

Output goes to `dist/`.

---

## Tests & Linting

```bash
# Unit tests
npm test

# Lint
npm run lint

# Format check
npm run format:check
```
