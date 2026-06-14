# Build context: services/ (parent directory)
# docker build -f analytics-service/Dockerfile -t urbanflow/analytics-service .

FROM node:20-alpine AS deps

COPY shared /app/shared

WORKDIR /app/analytics-service

COPY analytics-service/package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS production

RUN addgroup -g 1001 urbanflow \
  && adduser -S -u 1001 -G urbanflow urbanflow

WORKDIR /app/analytics-service

COPY --from=deps /app/analytics-service/node_modules ./node_modules
COPY shared /app/shared
COPY analytics-service/src ./src
COPY analytics-service/package.json ./

ENV NODE_ENV=production \
    PORT=3005 \
    SERVICE_NAME=analytics-service \
    MYSQL_DATABASE=analytics_db \
    NODE_PATH=/app/analytics-service/node_modules

USER urbanflow

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3005/health || exit 1

CMD ["node", "src/index.js"]
