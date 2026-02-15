import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import ProgressBar from '../../components/common/ProgressBar'
import ChoiceQuestion from '../../components/practice/ChoiceQuestion'
import { useCourseStore } from '../../stores/courseStore'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const mockQuestions: QuizQuestion[] = [
  {
    id: 'Q1',
    question: 'What does "runway" mean?',
    options: ['跑道', '机翼', '驾驶舱', '螺旋桨'],
    correctAnswer: '跑道',
    explanation: 'The runway is where the plane takes off and lands.'
  },
  {
    id: 'Q2',
    question: 'What is "visibility" in aviation?',
    options: ['能见度', '高度', '速度', '温度'],
    correctAnswer: '能见度',
    explanation: 'Visibility refers to how far you can see.'
  },
  {
    id: 'Q3',
    question: 'What does a pilot say before takeoff?',
    options: ['Request landing', 'Ready for takeoff', 'Clearance denied', 'Taxi to gate'],
    correctAnswer: 'Ready for takeoff',
    explanation: 'Pilots announce they are ready for takeoff.'
  },
  {
    id: 'Q4',
    question: 'What does "turbulence" mean?',
    options: ['平稳飞行', '颠簸', '降落', '滑行'],
    correctAnswer: '颠簸',
    explanation: 'Turbulence is when the plane shakes in the air.'
  },
  {
    id: 'Q5',
    question: 'Where do passengers go after security?',
    options: ['Runway', 'Gate', 'Terminal', 'Luggage claim'],
    correctAnswer: 'Gate',
    explanation: 'Passengers go to the gate to board their flight.'
  }
]

export default function QuizPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { modules } = useCourseStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  
  const moduleId = searchParams.get('module')
  const module = moduleId ? modules.find(m => m.id === moduleId) : null
  const questions = mockQuestions.slice(0, 5)
  
  useEffect(() => {
    if (showResult) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [showResult])
  
  const handleAnswer = (isCorrect: boolean) => {
    setAnswers(prev => [...prev, isCorrect])
    if (isCorrect) {
      setScore(prev => prev + 20)
    }
  }
  
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      handleFinish()
    }
  }
  
  const handleFinish = () => {
    setShowResult(true)
  }
  
  const getScoreLevel = () => {
    if (score >= 80) return { text: '优秀！', color: 'text-green-600' }
    if (score >= 60) return { text: '良好！', color: 'text-blue-600' }
    if (score >= 40) return { text: '继续加油！', color: 'text-yellow-600' }
    return { text: '需要多练习', color: 'text-red-600' }
  }
  
  const progress = ((currentIndex + 1) / questions.length) * 100
  const currentQuestion = questions[currentIndex]
  
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
          <div className="mt-4 text-sm text-gray-600">
            正确 {answers.filter(a => a).length} / {questions.length} 题
          </div>
        </Card>
        
        <div className="flex gap-4 justify-center">
          <Button variant="secondary" onClick={() => navigate('/practice')}>
            返回练习
          </Button>
          <Button variant="primary" onClick={() => {
            setCurrentIndex(0)
            setScore(0)
            setAnswers([])
            setShowResult(false)
            setTimeLeft(60)
          }}>
            🔄 再测一次
          </Button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
          ← 返回
        </Button>
        <div className="flex-1">
          <ProgressBar value={progress} max={100} />
        </div>
        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {questions.length}
        </div>
        <div className="text-sm text-gray-600">
          ⏱️ {timeLeft}s
        </div>
      </div>
      
      {/* 模块信息 */}
      {module && (
        <div className="text-center">
          <span className="text-2xl">{module.icon}</span>
          <span className="font-bold ml-2">{module.name}</span>
        </div>
      )}
      
      {/* 题目卡片 */}
      <Card>
        <ChoiceQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
        />
      </Card>
      
      {/* 下一题 */}
      {answers.length === currentIndex + 1 && (
        <div className="text-center">
          <Button variant="primary" size="lg" onClick={handleNext}>
            {currentIndex < questions.length - 1 ? '下一题 →' : '完成测验'}
          </Button>
        </div>
      )}
    </div>
  )
}
