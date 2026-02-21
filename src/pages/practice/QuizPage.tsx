import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import ChoiceQuestion from '../../components/practice/ChoiceQuestion'
import { useCourseStore } from '../../stores/courseStore'
import { useUserStore } from '../../stores/userStore'
import { fetchQuizQuestions, submitQuizAttempt } from '../../lib/api'
import type { Question } from '../../types'

interface QuizQuestion extends Question {
  moduleCode: string
}

interface AnswerRecord {
  questionId: string
  moduleCode: string
  selectedAnswer: string
  isCorrect: boolean
  timeSpent: number
}

const QUIZ_TIME_SECONDS = 60
const QUIZ_QUESTION_COUNT = 5

export default function QuizPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { modules } = useCourseStore()
  const { user } = useUserStore()

  const moduleId = searchParams.get('module')
  const module = moduleId ? modules.find((m) => m.id === moduleId) : null

  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [records, setRecords] = useState<AnswerRecord[]>([])
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_SECONDS)
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now())
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setLoadError(null)

    try {
      const response = await fetchQuizQuestions(moduleId, QUIZ_QUESTION_COUNT)
      const mapped: QuizQuestion[] = response.map((item) => ({
        id: item.id,
        moduleCode: item.module_code,
        question: item.question_text,
        options: item.options,
        correctAnswer: item.correct_answer,
        explanation: item.explanation ?? undefined,
      }))
      setQuestions(mapped)
      setCurrentIndex(0)
      setAnswers([])
      setRecords([])
      setShowResult(false)
      setTimeLeft(QUIZ_TIME_SECONDS)
      setQuestionStartedAt(Date.now())
      setSubmitError(null)
    } catch (error) {
      console.error('加载题库失败', error)
      setQuestions([])
      setLoadError('题库加载失败，请确认后端服务和数据库已启动。')
    } finally {
      setLoading(false)
    }
  }, [moduleId])

  useEffect(() => {
    void loadQuestions()
  }, [loadQuestions])

  useEffect(() => {
    setQuestionStartedAt(Date.now())
  }, [currentIndex, questions.length])

  const submitRecords = useCallback(async (attempts: AnswerRecord[]) => {
    if (attempts.length === 0) return

    setIsSubmitting(true)
    setSubmitError(null)

    const results = await Promise.allSettled(
      attempts.map((attempt) =>
        submitQuizAttempt({
          userId: user?.id ?? null,
          moduleCode: attempt.moduleCode,
          questionId: attempt.questionId,
          userAnswer: attempt.selectedAnswer,
          isCorrect: attempt.isCorrect,
          score: attempt.isCorrect ? 100 : 0,
          timeSpent: attempt.timeSpent,
        }),
      ),
    )

    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed > 0) {
      setSubmitError(`有 ${failed} 条练习记录提交失败。`)
    }

    setIsSubmitting(false)
  }, [user?.id])

  const handleFinish = useCallback(() => {
    if (showResult) return
    setShowResult(true)
    void submitRecords(records)
  }, [records, showResult, submitRecords])

  useEffect(() => {
    if (showResult || loading) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [showResult, loading, handleFinish])

  const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
    const currentQuestion = questions[currentIndex]
    if (!currentQuestion) return

    const elapsedSeconds = Math.max(1, Math.round((Date.now() - questionStartedAt) / 1000))

    setAnswers((prev) => [...prev, isCorrect])
    setRecords((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        moduleCode: currentQuestion.moduleCode,
        selectedAnswer,
        isCorrect,
        timeSpent: elapsedSeconds,
      },
    ])
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      return
    }
    handleFinish()
  }

  const totalQuestions = questions.length
  const correctCount = useMemo(() => answers.filter(Boolean).length, [answers])
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  const getScoreLevel = () => {
    if (score >= 80) return { text: '优秀！', color: 'text-green-600' }
    if (score >= 60) return { text: '良好！', color: 'text-blue-600' }
    if (score >= 40) return { text: '继续加油！', color: 'text-yellow-600' }
    return { text: '需要多练习', color: 'text-red-600' }
  }

  const progress = totalQuestions > 0 ? ((Math.min(currentIndex + 1, totalQuestions)) / totalQuestions) * 100 : 0
  const currentQuestion = questions[currentIndex]

  if (loading) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">题库加载中...</h2>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-red-600">{loadError}</h2>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/practice')}>
            返回练习
          </Button>
          <Button variant="primary" onClick={() => void loadQuestions()}>
            重试加载
          </Button>
        </div>
      </div>
    )
  }

  if (!currentQuestion && !showResult) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">当前没有可用题目</h2>
        <Button variant="secondary" onClick={() => navigate('/practice')}>
          返回练习
        </Button>
      </div>
    )
  }

  if (showResult) {
    const level = getScoreLevel()
    return (
      <div className="text-center py-10 space-y-6">
        <div className="text-8xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-aviation-blue">测验完成！</h1>

        <Card className="max-w-md mx-auto">
          <div className="text-6xl font-bold text-aviation-blue mb-2">{score}%</div>
          <p className={`text-xl font-bold ${level.color}`}>{level.text}</p>
          <ProgressBar
            value={score}
            max={100}
            color={score >= 80 ? 'green' : score >= 60 ? 'blue' : score >= 40 ? 'yellow' : 'red'}
          />
          <div className="mt-4 text-sm text-gray-600">正确 {correctCount} / {totalQuestions} 题</div>
          {isSubmitting && <div className="mt-2 text-sm text-gray-500">正在同步练习记录...</div>}
          {submitError && <div className="mt-2 text-sm text-red-600">{submitError}</div>}
        </Card>

        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => navigate('/practice')}>
            返回练习
          </Button>
          <Button variant="primary" onClick={() => void loadQuestions()}>
            🔄 再测一次
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
        <div className="flex-1">
          <ProgressBar value={progress} max={100} />
        </div>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {totalQuestions}
        </div>
        <div className="text-sm text-gray-600">⏱️ {timeLeft}s</div>
      </div>

      {module && (
        <div className="text-center">
          <span className="text-2xl">{module.icon}</span>
          <span className="font-bold ml-2">{module.name} 专项练习</span>
        </div>
      )}

      <Card>
        <ChoiceQuestion key={currentQuestion.id} question={currentQuestion} onAnswer={handleAnswer} />
      </Card>

      {answers.length === currentIndex + 1 && (
        <div className="text-center">
          <Button variant="primary" size="lg" onClick={handleNext}>
            {currentIndex < totalQuestions - 1 ? '下一题 →' : '完成测验'}
          </Button>
        </div>
      )}
    </div>
  )
}
