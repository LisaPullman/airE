import cors from 'cors'
import dotenv from 'dotenv'
import express, { type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import { query, close } from './lib/db'
import {
  createGoal,
  getAllModules,
  getFullModule,
  getFullModules,
  getQuizQuestions,
  getTodayStats,
  getUserById,
  getUserGoals,
  submitPracticeAttempt,
} from './services'

dotenv.config()

const app = express()

// 信任一层反向代理（nginx/Docker compose），否则 express-rate-limit 会在代理后误判 IP
app.set('trust proxy', 1)

// 严格的 CORS：未配置 CORS_ORIGIN 时只允许同源，避免默认放行 * 带来的凭证泄漏
const rawCorsOrigin = process.env.CORS_ORIGIN
const allowedOrigins =
  rawCorsOrigin && rawCorsOrigin !== '*'
    ? rawCorsOrigin.split(',').map((s) => s.trim()).filter(Boolean)
    : null

app.use(
  cors({
    origin: (origin, callback) => {
      // 同源请求 / curl 等没有 Origin 头的情况
      if (!origin) return callback(null, true)
      if (!allowedOrigins) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '64kb' }))

// 全局限流：每 IP 每分钟最多 120 次请求
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited' },
})

// 写入接口（POST）单独更严格的限流：每 IP 每分钟 30 次
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'rate_limited' },
})

app.use(globalLimiter)

const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next)
  }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MODULE_CODE_RE = /^M[1-9]$/

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'takeoff-aviation-backend',
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

// 注意: 必须在 /api/modules/:moduleId 之前注册,避免 "full" 被当作 moduleId
app.get(
  '/api/modules/full',
  asyncHandler(async (_req, res) => {
    const modules = await getFullModules()
    res.json({ data: modules })
  }),
)

app.get(
  '/api/modules/:moduleId',
  asyncHandler(async (req, res) => {
    const moduleId = req.params.moduleId
    // 接受 UUID 或 module code（M1-M9）
    if (!UUID_RE.test(moduleId) && !MODULE_CODE_RE.test(moduleId)) {
      res.status(400).json({ error: 'invalid_module_id' })
      return
    }
    const module = await getFullModule(moduleId)
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
    const { userId } = req.params
    if (!UUID_RE.test(userId)) {
      res.status(400).json({ error: 'invalid_user_id' })
      return
    }
    const user = await getUserById(userId)
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
    const { userId } = req.params
    if (!UUID_RE.test(userId)) {
      res.status(400).json({ error: 'invalid_user_id' })
      return
    }
    const goals = await getUserGoals(userId)
    res.json({ data: goals })
  }),
)

app.post(
  '/api/goals',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const { userId, name, moduleId = null, targetScore = 80 } = req.body ?? {}

    if (typeof userId !== 'string' || !UUID_RE.test(userId)) {
      res.status(400).json({ error: 'invalid_payload', message: 'userId must be a UUID' })
      return
    }
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
      res.status(400).json({ error: 'invalid_payload', message: 'name must be a non-empty string up to 200 chars' })
      return
    }
    if (moduleId !== null && (typeof moduleId !== 'string' || !UUID_RE.test(moduleId))) {
      res.status(400).json({ error: 'invalid_payload', message: 'moduleId must be a UUID or null' })
      return
    }
    const safeTargetScore = Math.max(0, Math.min(100, Math.floor(Number(targetScore) || 80)))

    const created = await createGoal(userId, name.trim(), moduleId, safeTargetScore)
    res.status(201).json({ data: created })
  }),
)

app.get(
  '/api/practice/:userId/stats/today',
  asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!UUID_RE.test(userId)) {
      res.status(400).json({ error: 'invalid_user_id' })
      return
    }
    const stats = await getTodayStats(userId)
    res.json({ data: stats })
  }),
)

app.get(
  '/api/quiz/questions',
  asyncHandler(async (req, res) => {
    const moduleCode = typeof req.query.moduleCode === 'string' ? req.query.moduleCode : null
    if (moduleCode !== null && !MODULE_CODE_RE.test(moduleCode)) {
      res.status(400).json({ error: 'invalid_module_code' })
      return
    }
    const limitRaw = typeof req.query.limit === 'string' ? Number(req.query.limit) : 5
    const questions = await getQuizQuestions(
      moduleCode,
      Number.isFinite(limitRaw) ? limitRaw : 5,
    )
    res.json({ data: questions })
  }),
)

app.post(
  '/api/quiz/attempt',
  writeLimiter,
  asyncHandler(async (req, res) => {
    const {
      userId = null,
      moduleCode = null,
      questionId,
      userAnswer,
      isCorrect,
      score = 0,
      timeSpent = 0,
    } = req.body ?? {}

    if (userId !== null && (typeof userId !== 'string' || !UUID_RE.test(userId))) {
      res.status(400).json({ error: 'invalid_payload', message: 'userId must be a UUID string or null' })
      return
    }
    if (typeof questionId !== 'string' || questionId.length === 0 || questionId.length > 64) {
      res.status(400).json({ error: 'invalid_payload', message: 'questionId is required (string, 1-64 chars)' })
      return
    }
    if (typeof userAnswer !== 'string' || userAnswer.length > 1000) {
      res.status(400).json({ error: 'invalid_payload', message: 'userAnswer must be a string (≤1000 chars)' })
      return
    }
    if (typeof isCorrect !== 'boolean') {
      res.status(400).json({ error: 'invalid_payload', message: 'isCorrect(boolean) is required' })
      return
    }
    if (moduleCode !== null && (typeof moduleCode !== 'string' || !MODULE_CODE_RE.test(moduleCode))) {
      res.status(400).json({ error: 'invalid_payload', message: 'moduleCode must be M1-M9 or null' })
      return
    }

    const record = await submitPracticeAttempt({
      userId,
      moduleCode,
      questionId,
      userAnswer,
      isCorrect,
      score: Number(score),
      timeSpent: Number(timeSpent),
    })

    res.status(201).json({ data: record })
  }),
)

app.use((_req, res) => {
  res.status(404).json({ error: 'not_found' })
})

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // 仅在开发环境打印堆栈，生产环境只记录错误信息
  if (process.env.NODE_ENV === 'production') {
    console.error('[api error]', (err as Error)?.message ?? err)
  } else {
    console.error('❌ API error:', err)
  }
  if (err instanceof Error && err.message.startsWith('CORS blocked')) {
    res.status(403).json({ error: 'cors_blocked' })
    return
  }
  res.status(500).json({ error: 'internal_server_error' })
})

const port = Number(process.env.BACKEND_PORT || process.env.PORT || 3001)
const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 Backend running on http://localhost:${port}`)
})

const shutdown = async () => {
  // eslint-disable-next-line no-console
  console.log('🛑 Shutting down backend...')
  server.close(async () => {
    await close()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
