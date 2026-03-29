# TinyURL GUI

Angular 19 frontend for the TinyURL service. Provides a UI for shortening URLs, with QR code generation and an FAQ page.

- **Live:** [tinyurl.buffden.com](https://tinyurl.buffden.com)
- **Backend API:** [go.buffden.com](https://go.buffden.com)

![Demo](docs/demo/tinyurl-demo.gif)

---

## Stack

- Angular 19 with SSR (`@angular/ssr`)
- Angular Material 19
- QR code generation (`angularx-qrcode`)
- Nginx (dev proxy + production serving)

---

## Running Locally

### Dev server (proxies API to backend)

```bash
npm install
npm start
```

App runs at `http://localhost:4200`. API calls are proxied to `http://localhost:8080` via `proxy.conf.json`.

> The backend stack must be running. Start it from the repo root with `docker compose up`.

### Dev server via Docker

```bash
npm run start:docker
```

This runs the Angular dev server in a container with live reload. Requires the backend network (`tinyurl_public`) to already exist.

---

## Building

### Development build (watch mode)

```bash
npm run build -- --watch --configuration development
```

### Production build

```bash
npm run build
```

Output is in `dist/`.

---

## Tests & Linting

```bash
# Unit tests
npm test

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format check
npm run format:check

# Format
npm run format
```

---

## Environments

| Environment | Command | URL |
| --- | --- | --- |
| Local dev (native) | `npm start` | `http://localhost:4200` |
| Local dev (Docker) | `npm run start:docker` | `http://localhost:4200` |
| Production | Deployed via GitHub Actions to S3 + CloudFront | [tinyurl.buffden.com](https://tinyurl.buffden.com) |
