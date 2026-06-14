# Build context: services/
# docker build -f gps-service/Dockerfile -t urbanflow/gps-service .

FROM node:20-alpine AS deps

COPY shared /app/shared

WORKDIR /app/gps-service

COPY gps-service/package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS production

RUN addgroup -g 1001 urbanflow \
  && adduser -S -u 1001 -G urbanflow urbanflow

WORKDIR /app/gps-service

COPY --from=deps /app/gps-service/node_modules ./node_modules
COPY shared /app/shared
COPY gps-service/src ./src
COPY gps-service/package.json ./

ENV NODE_ENV=production \
    PORT=3003 \
    SERVICE_NAME=gps-service \
    MYSQL_DATABASE=gps_db \
    GPS_API_KEY=urbanflow-gps-dev-key \
    NODE_PATH=/app/gps-service/node_modules

USER urbanflow

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3003/health || exit 1

CMD ["node", "src/index.js"]
