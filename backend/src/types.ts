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
