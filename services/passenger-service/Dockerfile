# Build context: services/ (parent directory)
# docker build -f passenger-service/Dockerfile -t urbanflow/passenger-service .

FROM node:20-alpine AS deps

COPY shared /app/shared

WORKDIR /app/passenger-service

COPY passenger-service/package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS production

RUN addgroup -g 1001 urbanflow \
  && adduser -S -u 1001 -G urbanflow urbanflow

WORKDIR /app/passenger-service

COPY --from=deps /app/passenger-service/node_modules ./node_modules
COPY shared /app/shared
COPY passenger-service/src ./src
COPY passenger-service/package.json ./

ENV NODE_ENV=production \
    PORT=3002 \
    SERVICE_NAME=passenger-service \
    MYSQL_DATABASE=passenger_db \
    NODE_PATH=/app/passenger-service/node_modules

USER urbanflow

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3002/health || exit 1

CMD ["node", "src/index.js"]
