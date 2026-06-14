# Build context: services/
# docker build -f notification-service/Dockerfile -t urbanflow/notification-service .

FROM node:20-alpine AS deps

COPY shared /app/shared

WORKDIR /app/notification-service

COPY notification-service/package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS production

RUN addgroup -g 1001 urbanflow \
  && adduser -S -u 1001 -G urbanflow urbanflow

WORKDIR /app/notification-service

COPY --from=deps /app/notification-service/node_modules ./node_modules
COPY shared /app/shared
COPY notification-service/src ./src
COPY notification-service/package.json ./

ENV NODE_ENV=production \
    PORT=3004 \
    SERVICE_NAME=notification-service \
    MYSQL_DATABASE=notification_db \
    NODE_PATH=/app/notification-service/node_modules

USER urbanflow

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3004/health || exit 1

CMD ["node", "src/index.js"]
