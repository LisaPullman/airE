import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import type { Sentence } from '../../types'

interface SentenceCardProps {
  sentence: Sentence
  index: number
}

export default function SentenceCard({ sentence, index }: SentenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  
  const playAudio = () => {
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 2000)
  }
  
  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // 模拟录音
      setTimeout(() => setIsRecording(false), 3000)
    }
  }
  
  return (
    <Card hover className="transition-all duration-300">
      <div className="flex items-start gap-4">
        {/* 序号 */}
        <div className="w-10 h-10 rounded-full bg-aviation-light text-white flex items-center justify-center font-bold shrink-0">
          {index + 1}
        </div>
        
        {/* 内容 */}
        <div className="flex-1">
          <div className="mb-2">
            <p className="text-xl font-medium text-aviation-blue">{sentence.english}</p>
            <p className="text-lg text-gray-700">{sentence.chinese}</p>
          </div>
          
          {/* 展开更多 */}
          {isExpanded && sentence.scenario && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">场景: </span>
              <span className="text-sm text-gray-700">{sentence.scenario}</span>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex gap-2 mt-4">
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={playAudio}
              disabled={isPlaying}
            >
              {isPlaying ? '🔊 播放中...' : '🔊 播放'}
            </Button>
            
            <Button 
              size="sm" 
              variant={isRecording ? 'danger' : 'primary'} 
              onClick={toggleRecording}
            >
              {isRecording ? '⏹️ 停止' : '🎤 跟读'}
            </Button>
            
            {sentence.scenario && (
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? '收起' : '场景'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
