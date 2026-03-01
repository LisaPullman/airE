# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**起飞航空 (Takeoff Aviation)** is an aviation English learning application for elementary school students. It features goal-driven learning, interactive quizzes, and an achievement system with aviation-themed titles.

## Common Commands

### Frontend (root directory)
```bash
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # TypeScript + Vite build -> dist/
npm run lint         # ESLint check
npm run test         # Vitest tests
```

### Backend (backend/ directory)
```bash
cd backend && npm install    # Install backend dependencies
cd backend && npm run dev    # Start with hot reload (localhost:3001)
cd backend && npm run build  # Compile TypeScript -> dist/
cd backend && npm run start  # Run compiled server
cd backend && npm run typecheck  # TypeScript check without emitting files
```

### Database (Docker)
```bash
npm run db:up        # Start PostgreSQL container (port 5433)
npm run db:down      # Stop container
npm run db:logs      # View PostgreSQL logs
npm run db:psql      # Open psql shell
npm run db:init      # Run schema.sql
npm run db:seed      # Run seed.sql
npm run db:reset     # Reinitialize database (init + seed)
```

### Full Stack Docker
```bash
docker compose up -d         # Start frontend + backend + postgres
docker compose down          # Stop all services
docker compose logs -f       # View all logs
```

Note: Docker PostgreSQL uses port **5433** (not 5432) to avoid conflicts with other services.

## Architecture

### Monorepo Structure
- **Frontend**: React 18 + TypeScript + Vite at repository root (`src/`)
- **Backend**: Express.js standalone service in `backend/`
- **Database**: PostgreSQL with Docker Compose in `sql/`

### Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite 5, Tailwind CSS, Zustand |
| Backend | Express.js, TypeScript, pg (node-postgres) |
| Database | PostgreSQL 16 with pgcrypto extension |

### State Management
- **courseStore** (`src/stores/courseStore.ts`): In-memory module/vocabulary data (mock)
- **userStore** (`src/stores/userStore.ts`): Persisted to localStorage (`takeoff-aviation-user-storage`)

### Backend Service Layer
Business logic is separated into service modules in `backend/src/services/`:
- `userService.ts` - User CRUD
- `courseService.ts` - Modules, vocabularies, sentences
- `goalService.ts` - Learning goals
- `practiceService.ts` - Practice records
- `quizService.ts` - Quiz questions and attempts
- `achievementService.ts` - Badges and achievements

## API Endpoints

Base URL: `VITE_API_BASE_URL` env var (default: `http://localhost:3001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| GET | `/health/db` | Database connectivity |
| GET | `/api/modules` | List all modules |
| GET | `/api/modules/:moduleId` | Get module with vocabularies/sentences |
| GET | `/api/users/:userId` | Get user by ID |
| GET | `/api/goals/:userId` | Get user goals |
| POST | `/api/goals` | Create new goal |
| GET | `/api/practice/:userId/stats/today` | Today's practice stats |
| GET | `/api/quiz/questions` | Get quiz questions (query: `moduleCode`, `limit`) |
| POST | `/api/quiz/attempt` | Submit quiz answer |

## Database Schema

8 tables with UUID primary keys:
| Table | Purpose |
|-------|---------|
| `users` | User profiles, levels, XP, badges (JSONB) |
| `modules` | Course modules (M1-M5) |
| `vocabularies` | Aviation vocabulary per module |
| `sentences` | Sentence patterns per module |
| `goals` | User learning goals with progress |
| `questions` | Quiz question bank (options as JSONB) |
| `practice_records` | User practice history |
| `learning_history` | Learning activity log |

All tables have `created_at TIMESTAMPTZ`. Users table has auto-updating `updated_at` via trigger.

## Environment Variables

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3001
```

### Backend (backend/.env)
```
BACKEND_PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/aire_learning  # Use 5433 for Docker
CORS_ORIGIN=http://127.0.0.1:5173
```

### Database (sql/.env for Docker)
```
POSTGRES_DB=aire_learning
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
```

## Key Conventions

### TypeScript Interfaces
- Frontend types in `src/types.ts`
- Backend types in `backend/src/types.ts`

### Tailwind Theme
Custom aviation-themed colors defined in `tailwind.config.js`:
- `aviation-sky`, `aviation-cloud`, `aviation-gold`
- `playful-coral`, `playful-mint`, `playful-lavender`
- Claymorphism shadows (`clay-shadow-*`)

### Frontend API Client
Use functions from `src/lib/api.ts` for backend calls:
```typescript
import { fetchQuizQuestions, submitQuizAttempt } from '@/lib/api'
```

### Development Workflow
1. Start database: `npm run db:up`
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `npm run dev` (in another terminal)

## Module Structure

5 learning modules (M1-M5):
| Code | Name |
|------|------|
| M1 | Aircraft English (飞机认知) |
| M2 | ATC Communication (塔台对话) |
| M3 | Weather Talk (飞行天气) |
| M4 | Flight Mission (飞行任务) |
| M5 | Emergency English (紧急情况) |

## Deployment

### Docker (Recommended for Production)
```bash
docker compose up -d    # Start all services (frontend on :8082, backend on :3001, postgres on :5433)
```

The Docker setup includes:
- **Frontend**: Nginx serving static React build
- **Backend**: Express.js API server
- **Database**: PostgreSQL 16
- **Network**: Connects to external `aerospace-network` for main project integration

### Static Hosting
- **GitHub Pages**: Via `.github/workflows/deploy.yml` (base path: `/takeoff-aviation/`)
- **Vercel**: Via `vercel.json` configuration
- Note: Static hosting requires backend/database to be hosted separately

### Environment Variables for Docker
- `VITE_API_BASE_URL` - Backend API URL (default: `http://43.143.108.114/aire-api`)
- `VITE_BASE_PATH` - Frontend base path (default: `/aire/`)
- `POSTGRES_PASSWORD` - Database password (default: `AirE@2026Secure`)
- `CORS_ORIGIN` - CORS allowed origin
