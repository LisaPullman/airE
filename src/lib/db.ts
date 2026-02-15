// PostgreSQL 数据库连接配置
import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aire_learning',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// 测试连接
pool.on('connect', () => {
  console.log('✅ 连接到 PostgreSQL 数据库')
})

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err)
})

// 查询封装
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const res = await pool.query(text, params)
  const duration = Date.now() - start
  console.log(`📊 查询执行时间: ${duration}ms`)
  return res
}

// 事务支持
export async function transaction<T>(
  callback: (client: any) => Promise<T>
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
