# JuntasCloud Frontend

Proyecto frontend base para JuntasCloud construido con React 19, TypeScript, Vite, Material UI v7, React Router v6 y Axios.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo `.env` tomando como base `.env.example`:

```bash
cp .env.example .env
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Variables de entorno

- `VITE_API_BASE_URL`: URL base del backend NestJS. Ejemplo: `http://localhost:3000`
- `VITE_PORT`: Puerto del servidor frontend en desarrollo. Ejemplo: `5173`

## Estructura principal

```text
src/
  app/
  api/
  auth/
  components/
  config/
  layout/
  pages/
  types/
```
