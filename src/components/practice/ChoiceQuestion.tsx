import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import type { Question } from '../../types'

interface ChoiceQuestionProps {
  question: Question
  onAnswer: (isCorrect: boolean) => void
}

export default function ChoiceQuestion({ question, onAnswer }: ChoiceQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  
  const handleSelect = (answer: string) => {
    if (showResult) return
    setSelectedAnswer(answer)
  }
  
  const handleSubmit = () => {
    if (!selectedAnswer) return
    const isCorrect = selectedAnswer === question.correctAnswer
    setShowResult(true)
    onAnswer(isCorrect)
  }
  
  return (
    <div className="space-y-6">
      {/* 问题 */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800">{question.question}</h3>
        {question.audioUrl && (
          <Button size="sm" variant="secondary" className="mt-2">
            🔊 播放音频
          </Button>
        )}
      </div>
      
      {/* 选项 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelect(option)}
            disabled={showResult}
            className={`p-4 text-left rounded-lg border-2 transition-all ${
              selectedAnswer === option
                ? 'border-aviation-light bg-blue-50'
                : 'border-gray-200 hover:border-aviation-light'
            } ${
              showResult && option === question.correctAnswer
                ? 'border-green-500 bg-green-50'
                : ''
            } ${
              showResult && option === selectedAnswer && option !== question.correctAnswer
                ? 'border-red-500 bg-red-50'
                : ''
            } ${showResult ? 'cursor-default' : 'cursor-pointer'}
            `}
          >
            <span className="font-medium">{option}</span>
          </button>
        ))}
      </div>
      
      {/* 结果和解释 */}
      {showResult && (
        <Card className={`${selectedAnswer === question.correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-center">
            <div className="text-4xl mb-2">
              {selectedAnswer === question.correctAnswer ? '✅ 正确！' : '❌ 再想想'}
            </div>
            {question.explanation && (
              <p className="text-gray-700 mt-2">{question.explanation}</p>
            )}
          </div>
        </Card>
      )}
      
      {/* 提交按钮 */}
      {!showResult && (
        <div className="text-center">
          <Button 
            onClick={handleSubmit} 
            disabled={!selectedAnswer}
            variant="primary"
          >
            确认答案
          </Button>
        </div>
      )}
    </div>
  )
}
