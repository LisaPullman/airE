import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

const weatherQuestions: QuizQuestion[] = [
  {
    id: 'WQ1',
    question: 'What does "visibility" mean in aviation?',
    options: ['能见度', '高度', '速度', '温度'],
    correctAnswer: '能见度',
    explanation: 'Visibility refers to how far you can see, important for safe landing.'
  },
  {
    id: 'WQ2',
    question: 'What should pilots avoid during thunderstorms?',
    options: ['Cloud flying', 'Direct flight path', 'Turbulence zones', 'Night flying'],
    correctAnswer: 'Turbulence zones',
    explanation: 'Thunderstorms create dangerous turbulence that can damage aircraft.'
  },
  {
    id: 'WQ3',
    question: '"Ceiling" in aviation weather refers to:',
    options: ['Cloud height', 'Building height', 'Mountain height', 'Runway length'],
    correctAnswer: 'Cloud height',
    explanation: 'Ceiling is the height of the lowest cloud layer.'
  },
  {
    id: 'WQ4',
    question: 'What is "crosswind"?',
    options: ['Wind from behind', 'Wind from side', 'Wind from front', 'No wind'],
    correctAnswer: 'Wind from side',
    explanation: 'Crosswind makes landing more challenging for pilots.'
  },
  {
    id: 'WQ5',
    question: 'If you hear "expect turbulence", you should:',
    options: ['Turn off seatbelt sign', 'Fasten your seatbelt', 'Open cabin door', 'Stand up'],
    correctAnswer: 'Fasten your seatbelt',
    explanation: 'Always buckle up when turbulence is expected!'
  }
]

export default function WeatherQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  
  const question = weatherQuestions[currentQuestion]
  const progress = ((currentQuestion) / weatherQuestions.length) * 100
  
  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)
    
    if (answer === question.correctAnswer) {
      setScore(score + 20)
    }
  }
  
  const handleNext = () => {
    if (currentQuestion < weatherQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setCompleted(true)
    }
  }
  
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
        <Button size="lg" variant="primary" onClick={() => {
          setCurrentQuestion(0)
          setSelectedAnswer(null)
          setShowResult(false)
          setScore(0)
          setCompleted(false)
        }}>
          🔄 再测一次
        </Button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {currentQuestion + 1} / {weatherQuestions.length}
        </span>
        <ProgressBar value={progress} max={100} size="sm" />
      </div>
      
      {/* 问题卡片 */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !showResult && handleAnswer(option)}
              disabled={showResult}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                showResult && option === question.correctAnswer
                  ? 'border-success-green bg-green-50'
                  : showResult && option === selectedAnswer && option !== question.correctAnswer
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
            selectedAnswer === question.correctAnswer ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <p className="font-bold mb-2">
              {selectedAnswer === question.correctAnswer ? '✅ 正确！' : '❌ 再想想'}
            </p>
            <p className="text-sm text-gray-700">{question.explanation}</p>
            
            <div className="mt-4">
              <Button onClick={handleNext} variant="primary">
                {currentQuestion < weatherQuestions.length - 1 ? '下一题 ➡️' : '查看结果 📊'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
