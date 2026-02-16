import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import type { Sentence } from '../../types'
import { speak, stopSpeaking } from '../../lib/speech'

interface SentenceCardProps {
  sentence: Sentence
  index: number
}

export default function SentenceCard({ sentence, index }: SentenceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)

  const playAudio = async () => {
    setPlayError(null)
    setIsPlaying(true)

    try {
      // 播放英文句子
      await speak(sentence.english, 'en-US', () => {
        setIsPlaying(false)
      })
    } catch (error) {
      setPlayError('语音播放失败，请检查浏览器设置')
      setIsPlaying(false)
    }
  }

  const playChinese = async () => {
    setPlayError(null)
    setIsPlaying(true)

    try {
      // 播放中文翻译
      await speak(sentence.chinese, 'zh-CN', () => {
        setIsPlaying(false)
      })
    } catch (error) {
      setPlayError('语音播放失败')
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    stopSpeaking()
    setIsPlaying(false)
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aviation-light to-aviation-blue text-white flex items-center justify-center font-bold shrink-0 shadow-clay">
          {index + 1}
        </div>

        {/* 内容 */}
        <div className="flex-1">
          <div className="mb-2">
            <p className="text-xl font-medium text-aviation-blue cursor-pointer hover:text-aviation-light transition-colors"
               onClick={playAudio}>
              {sentence.english}
            </p>
            <p className="text-lg text-gray-700">{sentence.chinese}</p>
          </div>

          {/* 展开更多 */}
          {isExpanded && sentence.scenario && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
              <span className="text-sm font-medium text-yellow-800">场景: </span>
              <span className="text-sm text-gray-700">{sentence.scenario}</span>
            </div>
          )}

          {/* 错误提示 */}
          {playError && (
            <p className="text-red-500 text-sm mt-2">{playError}</p>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 mt-4">
            {isPlaying ? (
              <Button
                size="sm"
                variant="danger"
                onClick={handleStop}
              >
                ⏹️ 停止
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={playAudio}
                >
                  🔊 英文
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={playChinese}
                >
                  🔊 中文
                </Button>
              </>
            )}

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
