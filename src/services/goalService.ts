// 目标服务层
import db from '../lib/db'
import type { Goal, GoalProgress } from '../types'

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
export async function createGoal(goal: Omit<Goal, 'id' | 'createdAt'>) {
  const result = await db.query(
    `INSERT INTO goals (user_id, name, module_id, target_score, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [goal.userId, goal.name, goal.moduleId, goal.targetScore, goal.status]
  )
  return result.rows[0]
}

// 更新目标状态
export async function updateGoalStatus(goalId: string, status: Goal['status']) {
  const result = await db.query(
    `UPDATE goals 
     SET status = $1,
         completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE completed_at END
     WHERE id = $2
     RETURNING *`,
    [status, goalId]
  )
  return result.rows[0]
}

// 获取目标进度
export async function getGoalProgress(goalId: string) {
  const result = await db.query(
    `SELECT * FROM goal_progress WHERE goal_id = $1`,
    [goalId]
  )
  return result.rows[0] || null
}

// 更新目标进度
export async function upsertGoalProgress(progress: Omit<GoalProgress, 'id'>) {
  const result = await db.query(
    `INSERT INTO goal_progress (goal_id, vocab_learned, sentences_learned, test_score, is_passed)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (goal_id) 
     DO UPDATE SET 
        vocab_learned = EXCLUDED.vocab_learned,
        sentences_learned = EXCLUDED.sentences_learned,
        test_score = EXCLUDED.test_score,
        is_passed = EXCLUDED.is_passed,
        updated_at = NOW()
     RETURNING *`,
    [progress.goalId, progress.vocabLearned, progress.sentencesLearned, progress.testScore, progress.isPassed]
  )
  return result.rows[0]
}

// 完成任务判定
export async function completeGoalIfPassed(goalId: string, testScore: number, targetScore: number) {
  if (testScore >= targetScore) {
    await updateGoalStatus(goalId, 'completed')
    return true
  }
  return false
}
