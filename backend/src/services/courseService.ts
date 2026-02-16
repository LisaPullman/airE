// 课程服务层 (精简版)
import db from '../lib/db'

// 获取所有模块
export async function getAllModules() {
  const result = await db.query(
    `SELECT * FROM modules WHERE is_active = true ORDER BY display_order`
  )
  return result.rows
}

// 根据 ID 获取模块
export async function getModuleById(moduleId: string) {
  const result = await db.query(
    `SELECT * FROM modules WHERE id = $1`,
    [moduleId]
  )
  return result.rows[0] || null
}

// 根据 Code 获取模块
export async function getModuleByCode(code: string) {
  const result = await db.query(
    `SELECT * FROM modules WHERE code = $1`,
    [code]
  )
  return result.rows[0] || null
}

// 获取模块的所有词汇
export async function getVocabulariesByModule(moduleId: string) {
  const result = await db.query(
    `SELECT * FROM vocabularies WHERE module_id = $1 ORDER BY display_order`,
    [moduleId]
  )
  return result.rows
}

// 获取模块的所有句型
export async function getSentencesByModule(moduleId: string) {
  const result = await db.query(
    `SELECT * FROM sentences WHERE module_id = $1 ORDER BY display_order`,
    [moduleId]
  )
  return result.rows
}

// 获取完整模块数据
export async function getFullModule(moduleId: string) {
  const module = await getModuleById(moduleId)
  if (!module) return null
  
  const vocabularies = await getVocabulariesByModule(moduleId)
  const sentences = await getSentencesByModule(moduleId)
  
  return {
    ...module,
    vocabularies,
    sentences
  }
}
