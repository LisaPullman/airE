export interface Badge {
  id: string
  name: string
  icon?: string
  description?: string
  earnedAt?: Date | string | null
}

export interface User {
  id: string
  username: string
  nickname: string
  level: number
  exp: number
  streakDays: number
  badges: Badge[]
}

export type GoalStatus = 'active' | 'completed' | 'abandoned'

export interface Goal {
  id: string
  userId: string
  name: string
  moduleId: string
  targetScore: number
  status: GoalStatus
  createdAt: Date | string
  completedAt?: Date | string
}

export interface Vocabulary {
  id: string
  moduleId: string
  word: string
  translation: string
  exampleSentence: string
  imageUrl?: string
}

export interface Sentence {
  id: string
  moduleId: string
  english: string
  chinese: string
  scenario?: string
}

export interface Module {
  id: string
  name: string
  description: string
  order: number
  icon: string
  vocabularies: Vocabulary[]
  sentences: Sentence[]
}

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
  audioUrl?: string
}

export interface PracticeRecord {
  id: string
  userId: string
  questionId: string
  moduleId: string
  score: number
  userAnswer: string
  isCorrect: boolean
  timeSpent: number
  createdAt: Date | string
}
