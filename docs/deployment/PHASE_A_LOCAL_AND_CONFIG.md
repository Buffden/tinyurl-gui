# Phase A — Local Dev Setup & Production Config

**Goal:** Local development works correctly, and production environment config is set to the right values before first deploy.
**Estimated time:** 30 minutes

---

## Checklist

- [ ] Step 1 — Local dev setup verified
- [ ] Step 2 — Confirm `environment.prod.ts` points to correct API URL
- [ ] Step 3 — Confirm `proxy.conf.json` is correct for local dev
- [ ] Step 4 — Verify build budget passes

---

## Step 1 — Local Dev Setup

### Prerequisites

- Node.js 20+ installed (`node --version`)
- Angular CLI installed globally (`npm install -g @angular/cli`)
- Backend running locally (`docker compose up -d` in the backend repo)

### Start local dev server

```bash
# Install dependencies
npm install

# Start Angular dev server
ng serve

# App available at: http://localhost:4200
# API calls proxied to: http://localhost:8080 (backend must be running)
```

The proxy is configured in `proxy.conf.json`:
```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false
  }
}
```

> **Never change the proxy target to a production URL.** Local dev should always talk to a local backend.

---

## Step 2 — Confirm `environment.prod.ts`

Open `src/environments/environment.prod.ts`. It must look exactly like this:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://go.buffden.com/api'
};
```

If `apiUrl` says `https://tinyurl.buffden.com/api` — **that is wrong.** The API lives at `go.buffden.com`, not `tinyurl.buffden.com`. Update it.

Compare with the dev environment (`src/environments/environment.ts`):

```typescript
export const environment = {
  production: false,
  apiUrl: '/api'   // Relative — proxied to localhost:8080 by proxy.conf.json
};
```

The `angular.json` build config swaps `environment.ts` → `environment.prod.ts` automatically when you run `ng build --configuration=production`.

---

## Step 3 — Confirm `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

This file is only used during `ng serve` (local dev). It is ignored in production builds. The proxy is referenced in `angular.json` under `serve.options.proxyConfig`.

---

## Step 4 — Verify Build Budget Passes

Run a production build locally before deploying to catch any bundle size violations:

```bash
ng build --configuration=production
```

Expected output — look for these lines:
```
✓ Building...
Initial chunk files   | Names         |  Raw size | Estimated transfer size
main.XXXXXXXX.js      | main          | 200-400 kB | ...
styles.XXXXXXXX.css   | styles        | < 10 kB   | ...

Build at: ...  - Hash: ...
```

**Warnings to watch for:**

| Warning | Meaning | Action |
|---|---|---|
| `budget exceeded` on `initial` | JS bundle > 500 KB | Investigate large imports, add lazy loading |
| `budget exceeded` on component styles | Component CSS > 8 KB | Refactor styles |
| `WARNING in ...` (any) | Non-fatal but worth fixing | Address before prod |

If the build fails with budget errors, do not deploy — fix the bundle size first.

---

## Local Dev vs Production Comparison

| Concern | Local (`ng serve`) | Production (S3/CloudFront) |
|---|---|---|
| API URL | `/api` (proxied to `:8080`) | `https://go.buffden.com/api` |
| TLS | HTTP only | HTTPS enforced (CloudFront) |
| Source maps | Enabled | Disabled (minified) |
| File watching | Yes (hot reload) | No (static files) |
| Angular router | Works (dev server) | Needs CloudFront error page config (403/404 → `index.html`) |
| CORS | Not needed (same origin via proxy) | Required (cross-origin call to `go.buffden.com`) |

---

**Proceed to [Phase B — Manual Deploy](PHASE_B_MANUAL_DEPLOY.md).**
