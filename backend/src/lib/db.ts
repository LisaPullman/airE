// PostgreSQL 数据库连接配置
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// 慢查询阈值（毫秒），超过则记录到日志，便于排查性能问题
const SLOW_QUERY_MS = 200

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aire_learning',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 测试连接
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('✅ 连接到 PostgreSQL 数据库')
  }
})

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('❌ 数据库连接错误:', err)
})

// 查询封装
export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<R>> {
  const start = Date.now()
  const res = await pool.query<R>(text, params as unknown[])
  const duration = Date.now() - start
  if (duration >= SLOW_QUERY_MS) {
    console.warn(`🐢 慢查询 ${duration}ms: ${text.slice(0, 120)}`)
  }
  return res
}

// 事务支持
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

// 关闭连接池
export async function close() {
  await pool.end()
}

export default { query, transaction, close }
