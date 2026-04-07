ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-nodejs:20

# Build stage — standard node image for reliable npm/vite builds
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build && npm prune --omit=dev

# Runtime stage — HA base image (includes bashio)
FROM $BUILD_FROM
LABEL \
    io.hass.name="OLED Dashboard" \
    io.hass.description="OLED-optimized home dashboard with clock, weather, and Immich photo slideshow" \
    io.hass.type="addon" \
    io.hass.arch="aarch64|amd64|armhf|armv7"

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY index.js config.js openapi.js ./
COPY routes ./routes

COPY run.sh /run.sh
RUN chmod a+x /run.sh

CMD ["/run.sh"]
