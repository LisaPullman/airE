// 目标服务层 (精简版)
import db from '../lib/db'

// 获取用户的所有目标
export async function getUserGoals(userId: string) {
  const result = await db.query(
    `SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  )
  return result.rows
}

// 获取进行中的目标
export async function getActiveGoals(userId: string) {
  const result = await db.query(
    `SELECT * FROM goals WHERE user_id = $1 AND status = 'active' ORDER BY created_at DESC`,
    [userId]
  )
  return result.rows
}

// 创建目标
export async function createGoal(userId: string, name: string, moduleId: string | null, targetScore: number) {
  const result = await db.query(
    `INSERT INTO goals (user_id, name, module_id, target_score, status)
     VALUES ($1, $2, $3, $4, 'active')
     RETURNING *`,
    [userId, name, moduleId, targetScore]
  )
  return result.rows[0]
}

// 更新目标进度
export async function updateGoalProgress(
  goalId: string, 
  updates: { vocabLearned?: number; sentencesLearned?: number; testScore?: number }
) {
  const setClause: string[] = []
  const values: any[] = []
  let paramIndex = 1
  
  if (updates.vocabLearned !== undefined) {
    setClause.push(`vocab_learned = $${paramIndex++}`)
    values.push(updates.vocabLearned)
  }
  if (updates.sentencesLearned !== undefined) {
    setClause.push(`sentences_learned = $${paramIndex++}`)
    values.push(updates.sentencesLearned)
  }
  if (updates.testScore !== undefined) {
    setClause.push(`test_score = $${paramIndex++}`)
    values.push(updates.testScore)
  }
  
  values.push(goalId)
  
  const result = await db.query(
    `UPDATE goals SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  )
  return result.rows[0]
}

// 完成任务
export async function completeGoal(goalId: string) {
  const result = await db.query(
    `UPDATE goals SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *`,
    [goalId]
  )
  return result.rows[0]
}

// 放弃目标
export async function abandonGoal(goalId: string) {
  const result = await db.query(
    `UPDATE goals SET status = 'abandoned' WHERE id = $1 RETURNING *`,
    [goalId]
  )
  return result.rows[0]
}
