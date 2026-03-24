# Phase B — First Manual Deploy

**Goal:** Angular SPA live at `https://tinyurl.buffden.com` for the first time. All steps manual — CI/CD comes in Phase C.
**Prerequisites:**
- Phase A complete (config verified)
- Backend Phase A complete (S3 bucket `tinyurl-spa-prod` and CloudFront distribution exist)
- AWS CLI configured locally (`aws configure` or environment variables)
**Estimated time:** 15–20 minutes

---

## Checklist

- [ ] Step 1 — Build Angular for production
- [ ] Step 2 — Upload to S3
- [ ] Step 3 — Invalidate CloudFront cache
- [ ] Step 4 — Verify the deployment

---

## Step 1 — Build Angular for Production

```bash
# Install dependencies (if not already done)
npm ci

# Production build
ng build --configuration=production
```

The output goes to `dist/browser/`. Verify it contains:
```
dist/browser/
├── index.html
├── main.XXXXXXXX.js        ← hashed — changes every build
├── polyfills.XXXXXXXX.js
├── styles.XXXXXXXX.css
└── assets/
```

> The hash in the filename (`XXXXXXXX`) is generated from file content. If a file doesn't change, its hash stays the same — CloudFront serves the cached version. `index.html` is never hashed (Angular intentionally keeps it as `index.html`).

---

## Step 2 — Upload to S3

Two separate sync commands — one for hashed assets (long cache), one for `index.html` (no cache):

```bash
# Upload all hashed assets with 1-year cache (safe because filename changes each build)
aws s3 sync dist/browser/ s3://tinyurl-spa-prod/ \
  --delete \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --region us-east-1

# Upload index.html with no-cache (always serve the latest version)
aws s3 cp dist/browser/index.html s3://tinyurl-spa-prod/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html" \
  --region us-east-1
```

**Why two commands?**

| File | Cache strategy | Reason |
|---|---|---|
| `main.abc123.js` | 1 year | Filename changes if content changes — safe to cache aggressively |
| `index.html` | No cache | Always the same filename — must always be fresh so users load the latest app |

**Verify the upload:**
```bash
aws s3 ls s3://tinyurl-spa-prod/ --region us-east-1
```

You should see `index.html` and the hashed JS/CSS files.

---

## Step 3 — Invalidate CloudFront Cache

After uploading, CloudFront still serves the old cached files until the cache expires or is invalidated.

```bash
# Get your distribution ID (if you don't have it saved)
aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items[0]=='tinyurl.buffden.com'].Id" \
  --output text \
  --region us-east-1

# Create invalidation
aws cloudfront create-invalidation \
  --distribution-id <your-dist-id> \
  --paths "/*" \
  --region us-east-1
```

Wait for invalidation to complete (~30–60 seconds):
```bash
# Check status (run a few times until Status shows "Completed")
aws cloudfront list-invalidations \
  --distribution-id <your-dist-id> \
  --query "InvalidationList.Items[0].{Status:Status,Id:Id}" \
  --output table
```

---

## Step 4 — Verify the Deployment

```bash
# 1. Check index.html is accessible
curl -I https://tinyurl.buffden.com
# Expected: HTTP/2 200, content-type: text/html

# 2. Check cache headers on index.html
curl -I https://tinyurl.buffden.com/index.html | grep -i cache
# Expected: cache-control: no-cache, no-store, must-revalidate

# 3. Check HTTP redirects to HTTPS
curl -I http://tinyurl.buffden.com
# Expected: HTTP/1.1 301 or 302, Location: https://tinyurl.buffden.com/
```

**Browser verification:**
1. Open `https://tinyurl.buffden.com` — Angular app should load
2. Open DevTools → Console — no errors
3. Open DevTools → Network tab → enter a URL in the form and submit
4. You should see a `POST` request to `https://go.buffden.com/api/urls` returning 201
5. No CORS errors should appear in the console

---

## Rollback

If something looks wrong after deploying, you can quickly redeploy from a previous commit:

```bash
# Checkout previous commit
git checkout <previous-commit-sha>

# Rebuild
ng build --configuration=production

# Re-upload (same commands as Step 2)
aws s3 sync dist/browser/ s3://tinyurl-spa-prod/ \
  --delete --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable"

aws s3 cp dist/browser/index.html s3://tinyurl-spa-prod/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Invalidate again
aws cloudfront create-invalidation \
  --distribution-id <your-dist-id> \
  --paths "/*"
```

---

**Proceed to [Phase C — CI/CD Automation](PHASE_C_CICD.md).**
