# OLED Dashboard

This project contains a Vite React client and an Express server that serves the built client, video assets, Socket.IO events, and REST endpoints.

## Swagger Docs

Once the server is running, Swagger UI is available at `http://localhost:4000/api/docs`.

The raw OpenAPI document is available at `http://localhost:4000/api/docs/openapi.json`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the client dev server:

```bash
npm run dev
```

Run the Express server:

```bash
node index.js
```

Build the client for the Express server to serve:

```bash
npm run build
```
