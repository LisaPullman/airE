import { useCallback, useEffect, useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import { fetchQuizQuestions, type QuizQuestionApi } from '../../lib/api'

const QUIZ_COUNT = 5

export default function WeatherQuiz() {
  const [questions, setQuestions] = useState<QuizQuestionApi[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await fetchQuizQuestions('M4', QUIZ_COUNT)
      setQuestions(data)
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setCorrectCount(0)
      setCompleted(false)
    } catch (error) {
      console.error('加载天气题库失败', error)
      setQuestions([])
      setLoadError('题库加载失败，请确认后端服务和数据库已启动。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadQuestions()
  }, [loadQuestions])

  if (loading) {
    return <div className="text-center py-10 text-gray-500">题库加载中...</div>
  }

  if (loadError) {
    return (
      <div className="text-center py-10 space-y-4">
        <p className="text-red-600 font-bold">{loadError}</p>
        <Button variant="primary" onClick={() => void loadQuestions()}>
          重试加载
        </Button>
      </div>
    )
  }

  const total = questions.length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0

  if (completed) {
    return (
      <div className="text-center py-10">
        <div className="text-8xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-aviation-blue mb-4">测验完成！</h2>
        <Card className="max-w-md mx-auto mb-6">
          <div className="text-6xl font-bold text-success-green mb-2">{score}%</div>
          <p className="text-gray-600">你的得分</p>
          <ProgressBar value={score} max={100} color={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'} />
        </Card>
        <div className="text-xl text-gray-700 mb-6">
          {score >= 80 ? '太棒了！你已经掌握航空天气知识！' :
           score >= 60 ? '不错！继续努力会更好！' : '继续练习，你会进步很快！'}
        </div>
        <Button size="lg" variant="primary" onClick={() => void loadQuestions()}>
          🔄 再测一次
        </Button>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = (currentQuestion / total) * 100

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)

    if (answer === question.correct_answer) {
      setCorrectCount((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setCompleted(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {currentQuestion + 1} / {total}
        </span>
        <ProgressBar value={progress} max={100} size="sm" />
      </div>

      {/* 问题卡片 */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-6">{question.question_text}</h3>

        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => !showResult && handleAnswer(option)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                showResult && option === question.correct_answer
                  ? 'border-success-green bg-green-50'
                  : showResult && option === selectedAnswer && option !== question.correct_answer
                  ? 'border-danger-red bg-red-50'
                  : 'border-gray-200 hover:border-aviation-light hover:bg-blue-50'
              } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <span className="font-medium">{option}</span>
            </button>
          ))}
        </div>

        {/* 结果显示 */}
        {showResult && (
          <div className={`mt-6 p-4 rounded-lg ${
            selectedAnswer === question.correct_answer ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className="font-bold mb-2">
              {selectedAnswer === question.correct_answer ? '✅ 正确！' : '❌ 再想想'}
            </p>
            <p className="text-sm text-gray-700">{question.explanation}</p>

            <div className="mt-4">
              <Button onClick={handleNext} variant="primary">
                {currentQuestion < total - 1 ? '下一题 ➡️' : '查看结果 📊'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
