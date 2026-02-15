// 成就服务层
import db from '../lib/db'
import { getUserBadges, awardBadge } from './userService'

// 获取所有称号配置
export async function getAllTitles() {
  const result = await db.query(
    `SELECT * FROM pilot_titles ORDER BY level`
  )
  return result.rows
}

// 获取称号等级
export async function getTitleByLevel(level: number) {
  const result = await db.query(
    `SELECT * FROM pilot_titles WHERE level = $1`,
    [level]
  )
  return result.rows[0] || null
}

// 根据经验获取称号
export async function getTitleByExp(exp: number) {
  const result = await db.query(
    `SELECT * FROM pilot_titles 
     WHERE required_exp <= $1 
     ORDER BY required_exp DESC 
     LIMIT 1`,
    [exp]
  )
  return result.rows[0] || null
}

// 获取所有徽章配置
export async function getAllBadges() {
  const result = await db.query(
    `SELECT * FROM badge_configs`
  )
  return result.rows
}

// 检查并授予徽章
export async function checkAndAwardBadges(userId: string) {
  const awardedBadges = []
  
  // 获取用户当前状态
  const user = await db.query(`SELECT * FROM users WHERE id = $1`, [userId])
  if (!user.rows[0]) return []
  
  const userData = user.rows[0]
  
  // 检查模块完成徽章
  const completedModules = await db.query(
    `SELECT DISTINCT module_id FROM learning_history 
     WHERE user_id = $1 AND action_type = 'module_complete'`,
    [userId]
  )
  
  // 检查连续学习天数
  if (userData.streak_days >= 7) {
    const badge = await awardBadge(userId, 'full_attendance', '全勤飞行员')
    if (badge) awardedBadges.push(badge)
  }
  
  // 检查词汇量
  const vocabCount = await db.query(
    `SELECT COUNT(DISTINCT vocabulary_id) FROM learning_history 
     WHERE user_id = $1 AND action_type = 'view_vocab'`,
    [userId]
  )
  
  if (parseInt(vocabCount.rows[0].count) >= 100) {
    const badge = await awardBadge(userId, 'vocabulary_master', '词汇达人')
    if (badge) awardedBadges.push(badge)
  }
  
  return awardedBadges
}

// 获取用户已获得和未获得的徽章
export async function getUserBadgeStatus(userId: string) {
  const allBadges = await getAllBadges()
  const earnedBadges = await getUserBadges(userId)
  
  const earnedIds = new Set(earnedBadges.map(b => b.badge_id))
  
  return allBadges.map(badge => ({
    ...badge,
    isEarned: earnedIds.has(badge.id),
    earnedAt: earnedBadges.find(b => b.badge_id === badge.id)?.earned_at
  }))
}
