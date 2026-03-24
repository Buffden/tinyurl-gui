# Phase C — CI/CD Automation

**Goal:** Every merge to `main` automatically builds and deploys the Angular SPA to S3/CloudFront. No manual steps.
**Prerequisites:** Phase B complete (first manual deploy working)
**Estimated time:** 30–45 minutes

---

## Checklist

- [ ] Step 1 — Add GitHub Secrets
- [ ] Step 2 — Create deploy workflow
- [ ] Step 3 — Test by merging a small change
- [ ] Step 4 — Verify deployment logs

---

## How It Works

```
Developer merges PR to main
        │
        ▼
GitHub Actions runs deploy.yml
        │
        ├── Checkout code
        ├── npm ci + ng build --configuration=production
        │
        ├── Authenticate to AWS via OIDC
        │   (no AWS keys stored — GitHub assumes IAM role temporarily)
        │
        ├── aws s3 sync → tinyurl-spa-prod
        │   Hashed assets:  max-age=31536000 (1 year)
        │   index.html:     no-cache
        │
        └── aws cloudfront create-invalidation --paths "/*"
            Waits for invalidation to complete before finishing
```

---

## Step 1 — Add GitHub Secrets

Go to GitHub → `buffden/tinyurl-gui` → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Value | Where to find it |
|---|---|---|
| `CF_DIST_ID` | CloudFront distribution ID | AWS Console → CloudFront → Distributions → ID column |
| `AWS_ROLE_ARN` | `arn:aws:iam::<account-id>:role/role-github-actions-tinyurl` | AWS Console → IAM → Roles → `role-github-actions-tinyurl` → copy ARN |

> `AWS_ROLE_ARN` is the same role used by the backend repo. One IAM role grants permissions for both pipelines.

---

## Step 2 — Create Deploy Workflow

Create `.github/workflows/deploy.yml` in this repo:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build:
    name: Build Angular
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npx ng build --configuration=production

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: angular-dist
          path: dist/browser/
          retention-days: 1

  deploy:
    name: Deploy to S3 + CloudFront
    needs: build
    runs-on: ubuntu-latest
    permissions:
      id-token: write   # Required for OIDC
      contents: read

    steps:
      - name: Download build artifact
        uses: actions/download-artifact@v4
        with:
          name: angular-dist
          path: dist/browser/

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1

      - name: Upload hashed assets to S3 (long cache)
        run: |
          aws s3 sync dist/browser/ s3://tinyurl-spa-prod/ \
            --delete \
            --exclude "index.html" \
            --cache-control "public, max-age=31536000, immutable"

      - name: Upload index.html to S3 (no cache)
        run: |
          aws s3 cp dist/browser/index.html s3://tinyurl-spa-prod/index.html \
            --cache-control "no-cache, no-store, must-revalidate" \
            --content-type "text/html"

      - name: Invalidate CloudFront cache
        run: |
          INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DIST_ID }} \
            --paths "/*" \
            --query "Invalidation.Id" \
            --output text)

          echo "Waiting for invalidation $INVALIDATION_ID to complete..."

          aws cloudfront wait invalidation-completed \
            --distribution-id ${{ secrets.CF_DIST_ID }} \
            --id "$INVALIDATION_ID"

          echo "CloudFront cache cleared — deployment complete"

      - name: Smoke test
        run: |
          sleep 5
          STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://tinyurl.buffden.com)
          if [ "$STATUS" != "200" ]; then
            echo "Smoke test failed — https://tinyurl.buffden.com returned HTTP $STATUS"
            exit 1
          fi
          echo "Smoke test passed — HTTP $STATUS"
```

---

## Step 3 — Test the Pipeline

Make a small, safe change and merge it to `main`:

```bash
# Example: add a comment to environment.prod.ts
# Commit, push to a branch, open PR, merge
```

Watch GitHub Actions tab:
1. Workflow `Deploy Frontend` should trigger automatically
2. `Build Angular` job runs first — takes ~2 minutes
3. `Deploy to S3 + CloudFront` job runs after — takes ~1 minute
4. Both green = success

---

## Step 4 — Verify Deployment Logs

In GitHub Actions, click into the deploy job and expand each step:

**Expected output for "Upload hashed assets":**
```
upload: dist/browser/main.abc123.js to s3://tinyurl-spa-prod/main.abc123.js
upload: dist/browser/polyfills.def456.js to s3://tinyurl-spa-prod/polyfills.def456.js
...
```

**Expected output for "Invalidate CloudFront cache":**
```
Waiting for invalidation I1ABC2DEF3GH4IJ to complete...
CloudFront cache cleared — deployment complete
```

**Expected output for "Smoke test":**
```
Smoke test passed — HTTP 200
```

---

## Pipeline Behaviour by Branch

| Branch | What happens |
|---|---|
| `main` | Full build + deploy runs automatically |
| Any other branch | Nothing — no CI on feature branches (tests only on PR) |

---

## Adding PR Tests (Optional)

If you want tests to run on pull requests before merging, add a separate workflow `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npx ng test --watch=false --browsers=ChromeHeadless

      - name: Build check (production)
        run: npx ng build --configuration=production
```

This ensures a broken build or failing tests can't be merged to `main`.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `AccessDenied` on S3 upload | IAM role missing S3 permission | Check `role-github-actions-tinyurl` has S3 access to `tinyurl-spa-prod` |
| `AccessDenied` on CloudFront | IAM role missing CloudFront permission | Add `cloudfront:CreateInvalidation` to role policy |
| OIDC error: `could not assume role` | Trust policy not scoped to this repo | Add `repo:buffden/tinyurl-gui:ref:refs/heads/main` to OIDC trust condition |
| Build fails: `budget exceeded` | Angular bundle too large | Check for heavy imports, enable lazy loading |
| Smoke test fails HTTP 403 | CloudFront OAC or S3 policy issue | Check S3 bucket policy allows CloudFront OAC |
| App loads but API calls fail | Wrong API URL in `environment.prod.ts` | Confirm `apiUrl: 'https://go.buffden.com/api'` |
| Angular routes return 403/404 | CloudFront error pages not set | Add 403/404 → `/index.html` custom error response in CloudFront |
