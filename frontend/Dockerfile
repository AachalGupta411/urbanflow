# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm install

COPY . .

ARG VITE_TICKETING_API=
ARG VITE_PASSENGER_API=
ARG VITE_GPS_API=
ARG VITE_NOTIFICATION_API=
ARG VITE_ANALYTICS_API=

ENV VITE_TICKETING_API=$VITE_TICKETING_API \
    VITE_PASSENGER_API=$VITE_PASSENGER_API \
    VITE_GPS_API=$VITE_GPS_API \
    VITE_NOTIFICATION_API=$VITE_NOTIFICATION_API \
    VITE_ANALYTICS_API=$VITE_ANALYTICS_API

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
