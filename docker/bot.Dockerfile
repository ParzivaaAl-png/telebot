# apps/bot/Dockerfile (context is root of monorepo)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/bot/package*.json ./apps/bot/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci

COPY . .
RUN npm run --prefix packages/shared-types build
RUN npm run --prefix apps/bot build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/bot/package*.json ./apps/bot/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/bot/dist ./apps/bot/dist

CMD ["npm", "run", "--prefix", "apps/bot", "start"]
