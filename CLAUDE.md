# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server (port 3000, proxies /api and socket.io to :4000)
node index.js        # Express server (port 4000)
npm run build        # TypeScript check + Vite production build
npm run lint         # ESLint
npm run preview      # Preview the production build
```

For full-stack development, run both `npm run dev` and `node index.js` concurrently.

## Architecture

Two separate processes:

**Client** (`src/`) — Vite + React 19 + TypeScript. Entry: `src/main.tsx`. Providers: `ChakraProvider` (Chakra UI v3) + `QueryClientProvider` (TanStack Query). Built output (`dist/`) is served statically by Express in production.

**Server** (`index.js`) — Express 5 + Socket.IO (JavaScript, not TypeScript). Config is read from `/data/options.json` (HA addon) with `.env` fallback via `config.js`. Routes are split into `routes/` files and mounted in `index.js`. The OpenAPI document lives in `openapi.js`.

## Configuration

Config priority: `/data/options.json` (HA addon) → `.env` file (local dev). See `.env.example` for all variables.

| Variable | Description |
|---|---|
| `HA_URL` | Home Assistant base URL |
| `HA_TOKEN` | HA long-lived access token |
| `IMMICH_URL` | Immich server base URL |
| `IMMICH_API_KEY` | Immich API key |
| `IMMICH_ALBUM_ID` | (Optional) Pin a specific album for the photo slideshow |
| `PORT` | Express server port (default 4000) |

## Frontend Routes

| Path | Component | Description |
|---|---|---|
| `/` | redirect | → `/clock` |
| `/clock` | `ClockWeather` | Portrait OLED display: clock + NWS weather |
| `/blank` | `Blank` | Pure black screen (motion off) |
| `/photos` | `Photos` | Immich photo slideshow |
| `/control` | `Mobile` | Mobile remote control — emits socket events only, never navigates itself |

## Frontend Structure

```
src/
  main.tsx                        — ChakraProvider + QueryClientProvider
  App.tsx                         — RouterProvider
  router.tsx                      — createBrowserRouter, Layout wraps all routes
  routes/
    ClockWeather.tsx              — clock + weather page
    Blank.tsx                     — black screen
    Photos.tsx                    — Immich slideshow
    Mobile.tsx                    — remote control
  components/
    Layout.tsx                    — wraps Outlet with SocketViewListener + PageTransition
    PageTransition.tsx            — fade+scale animation on route mount
    SocketViewListener.tsx        — listens for change_view, navigates (skips /control)
    ClockDisplay.tsx              — 12-hour clock + date, no seconds
    WeatherCurrent.tsx            — current conditions (emoji, temp, humidity, wind)
    WeatherForecast.tsx           — 5-period hourly forecast strip
    PhotoSlide.tsx                — full-bleed crossfade image slide
    ViewButton.tsx                — button used in /control
  hooks/
    useWeather.ts                 — fetches /api/weather, refetches every 5min
    useImmichAlbums.ts            — fetches /api/photos/albums
    useAlbumPhotos.ts             — fetches /api/photos/albums/:id
    usePhotosConfig.ts            — fetches /api/photos/config (pinned album ID)
    useSocket.ts                  — socket.io-client connection status
  lib/
    queryClient.ts                — TanStack QueryClient singleton
    socket.ts                     — socket.io-client singleton (connects to window.location.origin)
```

## Backend Structure

```
index.js          — app setup, Socket.IO, mounts routers
config.js         — reads /data/options.json or .env
openapi.js        — OpenAPI document + Swagger UI renderer
routes/
  health.js       — GET /api
  docs.js         — GET /api/docs, GET /api/docs/openapi.json
  weather.js      — GET /api/weather (proxies HA NWS entity)
  photos.js       — GET /api/photos/config|albums|albums/:id|asset/:id/thumbnail
  views.js        — GET /api/change/:view (broadcasts change_view via io from app.locals)
  videos.js       — GET /api/videos/list, GET /videos/:file
```

## API Endpoints

- `GET /api` — health check
- `GET /api/weather` — current weather + 8-period forecast from HA `weather.nws_hourly` (edit entity name in `routes/weather.js` if needed)
- `GET /api/photos/config` — returns `{ defaultAlbumId }` from config
- `GET /api/photos/albums` — Immich album list
- `GET /api/photos/albums/:albumId` — assets in an album (images only)
- `GET /api/photos/asset/:assetId/thumbnail` — proxies Immich thumbnail (hides API key)
- `GET /api/change/:view` — broadcasts `change_view` to all Socket.IO clients
- `GET /api/videos/list` — lists `./videos/`
- `GET /api/docs` — Swagger UI

## Socket.IO

- Client emits `change` with a view name → server broadcasts `change_view` to all **other** clients
- `GET /api/change/:view` broadcasts to **all** clients (used by HA automations)
- `SocketViewListener` navigates on `change_view` but ignores it on `/control`
- `io` instance is passed to route handlers via `app.locals.io`

## Design Constraints (OLED)

- Background is always `#000000`
- Avoid static bright elements — they cause burn-in
- No dividers or decorative borders
- Font: Inter (loaded from Google Fonts in `index.html`)
- All sizes on `/clock` use `vw` units to scale to any portrait resolution
- `/clock` layout is portrait-optimised: clock fills the top, weather below

## Home Assistant Addon

- `config.yaml` — addon manifest (arch, ports, options schema)
- `run.sh` — entry point, reads bashio config into env vars
- `ha-automation.yaml` — example motion sensor automation
  - `binary_sensor.kitchen_motion_sensor_motion` on → `/clock`
  - `binary_sensor.kitchen_motion_sensor_motion` off → `/blank`
  - Uses `rest_command.oled_change_view` calling `GET /api/change/:view`

## Adding API Endpoints

1. Add the route handler in the appropriate `routes/*.js` file (or create a new one)
2. Mount it in `index.js`
3. Document it in `openapi.js`
