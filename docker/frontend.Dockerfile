# apps/frontend-miniapp/Dockerfile (context is root of monorepo)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/frontend-miniapp/package*.json ./apps/frontend-miniapp/
COPY packages/shared-types/package*.json ./packages/shared-types/
RUN npm ci

COPY . .
RUN npm run --prefix packages/shared-types build
RUN npm run --prefix apps/frontend-miniapp build

FROM nginx:alpine
COPY --from=builder /app/apps/frontend-miniapp/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
