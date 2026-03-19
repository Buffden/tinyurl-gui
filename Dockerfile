# ─── Stage 1: Development ────────────────────────────────────────────────────
FROM node:23-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 4200

CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--proxy-config", "proxy.conf.json", "--poll", "2000"]


# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:23-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx ng build --configuration production


# ─── Stage 3: Production (nginx) ─────────────────────────────────────────────
FROM nginx:1.27-alpine AS prod

COPY --from=build /app/dist/tinyurl-gui/browser /usr/share/nginx/html
COPY nginx.dev.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
