export interface QuizQuestionApi {
  id: string
  module_code: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation: string | null
}

/** 后端 /api/modules/full 返回的原始结构 */
interface ModuleApi {
  id: string
  code: string
  name: string
  description: string | null
  icon: string | null
  vocabularies: Array<{
    id: string
    code: string | null
    word: string
    translation: string
    example_sentence: string | null
  }>
  sentences: Array<{
    id: string
    code: string | null
    english: string
    chinese: string
  }>
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || 'http://localhost:3001'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      ...init,
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `request_failed:${response.status}`)
    }

    // Handle empty responses
    const text = await response.text()
    if (!text) {
      return undefined as T
    }

    return JSON.parse(text) as T
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('网络连接失败，请检查网络')
    }
    throw error
  }
}

/** 拉取全部模块(含词汇/句型),映射为前端 Module 结构(code 作为 id,与音频文件命名一致) */
export async function fetchFullModules(): Promise<import('../types').Module[]> {
  const result = await request<{ data: ModuleApi[] }>('/api/modules/full')
  return result.data.map((m) => ({
    id: m.code,
    name: m.name,
    description: m.description ?? '',
    order: 0,
    icon: m.icon ?? '✈️',
    vocabularies: m.vocabularies.map((v) => ({
      id: v.code ?? v.id,
      moduleId: m.code,
      word: v.word,
      translation: v.translation,
      exampleSentence: v.example_sentence ?? '',
    })),
    sentences: m.sentences.map((s) => ({
      id: s.code ?? s.id,
      moduleId: m.code,
      english: s.english,
      chinese: s.chinese,
    })),
  }))
}

export async function fetchQuizQuestions(moduleCode: string | null, limit = 5): Promise<QuizQuestionApi[]> {
  const query = new URLSearchParams()
  if (moduleCode) query.set('moduleCode', moduleCode)
  query.set('limit', String(limit))

  const result = await request<{ data: QuizQuestionApi[] }>(`/api/quiz/questions?${query.toString()}`)
  return result.data
}

export async function submitQuizAttempt(payload: {
  userId?: string | null
  moduleCode?: string | null
  questionId: string
  userAnswer: string
  isCorrect: boolean
  score: number
  timeSpent: number
}): Promise<void> {
  await request<{ data: unknown }>('/api/quiz/attempt', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
