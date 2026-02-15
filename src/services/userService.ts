// 用户服务层 (精简版)
import db from '../lib/db'

// 获取用户信息
export async function getUserById(userId: string) {
  const result = await db.query(
    `SELECT * FROM users WHERE id = $1`,
    [userId]
  )
  return result.rows[0] || null
}

// 根据用户名获取用户
export async function getUserByUsername(username: string) {
  const result = await db.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  )
  return result.rows[0] || null
}

// 创建用户
export async function createUser(username: string, passwordHash: string, nickname: string) {
  const result = await db.query(
    `INSERT INTO users (username, password_hash, nickname)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, passwordHash, nickname]
  )
  return result.rows[0]
}

// 更新用户经验
export async function updateUserExp(userId: string, expToAdd: number) {
  const result = await db.query(
    `UPDATE users 
     SET exp = exp + $1,
         level = (exp + $1) / 1000 + 1
     WHERE id = $2
     RETURNING *`,
    [expToAdd, userId]
  )
  return result.rows[0]
}

// 更新连续学习天数
export async function updateStreakDays(userId: string) {
  const result = await db.query(
    `UPDATE users 
     SET streak_days = streak_days + 1
     WHERE id = $1
     RETURNING *`,
    [userId]
  )
  return result.rows[0]
}

// 授予徽章
export async function awardBadge(userId: string, badge: { id: string; name: string; icon: string }) {
  const result = await db.query(
    `UPDATE users 
     SET badges = badges || $1::jsonb
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify([badge]), userId]
  )
  return result.rows[0]
}
