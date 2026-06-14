# Build context: services/
# docker build -f ticketing-service/Dockerfile -t urbanflow/ticketing-service .

FROM node:20-alpine AS deps

COPY shared /app/shared

WORKDIR /app/ticketing-service

COPY ticketing-service/package.json ./
RUN npm install --omit=dev

FROM node:20-alpine AS production

RUN addgroup -g 1001 urbanflow \
  && adduser -S -u 1001 -G urbanflow urbanflow

WORKDIR /app/ticketing-service

COPY --from=deps /app/ticketing-service/node_modules ./node_modules
COPY shared /app/shared
COPY ticketing-service/src ./src
COPY ticketing-service/package.json ./

ENV NODE_ENV=production \
    PORT=3001 \
    SERVICE_NAME=ticketing-service \
    MYSQL_DATABASE=ticketing_db \
    NODE_PATH=/app/ticketing-service/node_modules

USER urbanflow

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1

CMD ["node", "src/index.js"]
