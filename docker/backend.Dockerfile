# apps/backend/Dockerfile (context is root of monorepo)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci

COPY . .
RUN npm run --prefix packages/shared-types build
RUN npm run --prefix apps/backend prisma:generate
RUN npm run --prefix apps/backend build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "--prefix", "apps/backend", "start:prod"]
