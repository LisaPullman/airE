import cors from 'cors'
import dotenv from 'dotenv'
import express, { type NextFunction, type Request, type Response } from 'express'
import { query, close } from './lib/db'
import {
  createGoal,
  getAllModules,
  getFullModule,
  getTodayStats,
  getUserById,
  getUserGoals,
} from './services'

dotenv.config()

const app = express()
const port = Number(process.env.BACKEND_PORT || process.env.PORT || 3001)
const corsOrigin = process.env.CORS_ORIGIN || true

app.use(cors({ origin: corsOrigin }))
app.use(express.json())

const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next)
  }

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'airE-backend',
    timestamp: new Date().toISOString(),
  })
})

app.get(
  '/health/db',
  asyncHandler(async (_req, res) => {
    await query('SELECT 1 as ok')
    res.json({ status: 'ok', db: 'connected' })
  }),
)

app.get(
  '/api/modules',
  asyncHandler(async (_req, res) => {
    const modules = await getAllModules()
    res.json({ data: modules })
  }),
)

app.get(
  '/api/modules/:moduleId',
  asyncHandler(async (req, res) => {
    const module = await getFullModule(req.params.moduleId)
    if (!module) {
      res.status(404).json({ error: 'module_not_found' })
      return
    }
    res.json({ data: module })
  }),
)

app.get(
  '/api/users/:userId',
  asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.userId)
    if (!user) {
      res.status(404).json({ error: 'user_not_found' })
      return
    }
    res.json({ data: user })
  }),
)

app.get(
  '/api/goals/:userId',
  asyncHandler(async (req, res) => {
    const goals = await getUserGoals(req.params.userId)
    res.json({ data: goals })
  }),
)

app.post(
  '/api/goals',
  asyncHandler(async (req, res) => {
    const { userId, name, moduleId = null, targetScore = 80 } = req.body ?? {}
    if (!userId || !name) {
      res.status(400).json({ error: 'invalid_payload', message: 'userId and name are required' })
      return
    }

    const created = await createGoal(userId, name, moduleId, Number(targetScore))
    res.status(201).json({ data: created })
  }),
)

app.get(
  '/api/practice/:userId/stats/today',
  asyncHandler(async (req, res) => {
    const stats = await getTodayStats(req.params.userId)
    res.json({ data: stats })
  }),
)

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' })
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ API error:', err)
  res.status(500).json({ error: 'internal_server_error' })
})

const server = app.listen(port, () => {
  console.log(`🚀 Backend running on http://localhost:${port}`)
})

const shutdown = async () => {
  console.log('🛑 Shutting down backend...')
  server.close(async () => {
    await close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
