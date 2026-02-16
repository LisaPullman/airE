# airE Backend

## Quick start

```bash
cd backend
npm install
npm run dev
```

## Scripts

- `npm run dev`: start backend in watch mode
- `npm run build`: compile TypeScript to `dist/`
- `npm run start`: run compiled server from `dist/server.js`
- `npm run typecheck`: run TypeScript checking only

## Environment variables

Copy `.env.example` to `.env` and update values:

- `BACKEND_PORT`: API server port (default: `3001`)
- `DATABASE_URL`: PostgreSQL connection string
- `CORS_ORIGIN`: allowed frontend origin (default: `http://127.0.0.1:5173`)
