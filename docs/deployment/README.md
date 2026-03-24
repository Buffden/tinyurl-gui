# TinyURL GUI — Deployment Overview

**Live URL:** `https://tinyurl.buffden.com`
**Hosting:** AWS S3 + CloudFront (static SPA, no server)
**API it talks to:** `https://go.buffden.com/api` (backend repo)
**Region:** `us-east-1` (N. Virginia)
**Deploy trigger:** Automatic on merge to `main`

---

## What This App Is

Angular 19 single-page application. Users visit `tinyurl.buffden.com`, enter a long URL, and get back a short link at `https://go.buffden.com/{code}`. There is no server for the frontend — it's static files served from S3 via CloudFront CDN.

---

## Phase Index

| Phase | File | Goal |
|---|---|---|
| A | [PHASE_A_LOCAL_AND_CONFIG.md](PHASE_A_LOCAL_AND_CONFIG.md) | Local dev setup + production environment config |
| B | [PHASE_B_MANUAL_DEPLOY.md](PHASE_B_MANUAL_DEPLOY.md) | First manual build and S3/CloudFront deploy |
| C | [PHASE_C_CICD.md](PHASE_C_CICD.md) | GitHub Actions auto-deploy pipeline |

> **Infrastructure (S3 bucket, CloudFront distribution, Route 53 DNS) is provisioned in the backend repo.**
> See [backend docs Phase A](../../tinyurl/docs/deployment/PHASE_A_INFRASTRUCTURE.md) — Steps 9, 10, and 11.

---

## How Deployment Works

```
Developer merges PR to main
        │
        ▼
GitHub Actions (deploy.yml)
        │
        ├── npm ci + ng build --configuration=production
        │         Output: dist/browser/
        │
        ├── aws s3 sync dist/browser/ → s3://tinyurl-spa-prod/
        │         Hashed assets: cache 1 year
        │         index.html: no-cache
        │
        └── aws cloudfront create-invalidation --paths "/*"
                  Old cached files purged from edge nodes
                  Users get fresh build within ~60 seconds
```

---

## Environments

| Environment | URL | API | How to run |
|---|---|---|---|
| Local dev | `http://localhost:4200` | `http://localhost:8080/api` (proxied) | `ng serve` |
| Production | `https://tinyurl.buffden.com` | `https://go.buffden.com/api` | Auto-deploy on merge to `main` |

---

## Key Files

| File | Purpose |
|---|---|
| `src/environments/environment.ts` | Local dev config (`apiUrl: '/api'`) |
| `src/environments/environment.prod.ts` | Production config (`apiUrl: 'https://go.buffden.com/api'`) |
| `proxy.conf.json` | Dev proxy: forwards `/api` → `http://localhost:8080` |
| `angular.json` | Build config, output path, budgets |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

---

## GitHub Secrets Required

| Secret | Value | Where to get it |
|---|---|---|
| `CF_DIST_ID` | CloudFront distribution ID | AWS Console → CloudFront → Distributions |
| `AWS_ROLE_ARN` | IAM role ARN for OIDC | AWS Console → IAM → Roles → `role-github-actions-tinyurl` |

---

## Cost

Frontend hosting costs are minimal — part of the shared ~$54/month:

| Component | Cost |
|---|---|
| S3 (< 100 MB assets) | < $1/month |
| CloudFront (low traffic, PriceClass_100) | ~$1/month |
