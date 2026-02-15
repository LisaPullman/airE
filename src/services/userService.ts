// 用户服务层
import db from '../lib/db'
import type { User } from '../types'

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
export async function createUser(user: Omit<User, 'id' | 'createdAt'>) {
  const result = await db.query(
    `INSERT INTO users (username, password_hash, nickname, title, level, exp, streak_days)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [user.username, user.password_hash, user.nickname, user.title, user.level, user.exp, user.streak_days]
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

// 获取用户徽章
export async function getUserBadges(userId: string) {
  const result = await db.query(
    `SELECT * FROM user_badges WHERE user_id = $1`,
    [userId]
  )
  return result.rows
}

// 授予用户徽章
export async function awardBadge(userId: string, badgeId: string, badgeName: string) {
  const result = await db.query(
    `INSERT INTO user_badges (user_id, badge_id, badge_name)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, badge_id) DO NOTHING
     RETURNING *`,
    [userId, badgeId, badgeName]
  )
  return result.rows[0]
}
