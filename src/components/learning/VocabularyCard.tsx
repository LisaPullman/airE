import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import type { Vocabulary } from '../../types'
import { playAudioSequence, stopAudio } from '../../lib/audio'

interface VocabularyCardProps {
  vocabulary: Vocabulary
  index: number
}

export default function VocabularyCard({ vocabulary, index }: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playError, setPlayError] = useState<string | null>(null)

  const playAudio = async () => {
    setPlayError(null)
    setIsPlaying(true)

    try {
      // 先播放英文单词，短暂停顿后播放例句
      const steps = [
        { name: `${vocabulary.id}_word`, options: { fallbackText: vocabulary.word } },
        ...(vocabulary.exampleSentence
          ? [{ name: `${vocabulary.id}_example`, options: { fallbackText: vocabulary.exampleSentence } }]
          : []),
      ]
      await playAudioSequence(steps)
    } catch (error) {
      setPlayError('语音播放失败，请检查浏览器设置')
    } finally {
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    stopAudio()
    setIsPlaying(false)
  }

  return (
    <div className="perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-48 cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* 正面 */}
        <div className="absolute inset-0 backface-hidden">
          <Card className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-50">
            <div className="text-5xl mb-3">{vocabulary.imageUrl ? '🖼️' : '✈️'}</div>
            <h3 className="text-2xl font-bold text-aviation-blue">{vocabulary.word}</h3>
            <p className="text-sm text-gray-500 mt-2">点击查看释义</p>
          </Card>
        </div>

        {/* 背面 */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <Card className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{vocabulary.translation}</h3>
            <p className="text-sm text-gray-600 italic text-center px-4">"{vocabulary.exampleSentence}"</p>
          </Card>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 mt-3 justify-center">
        {isPlaying ? (
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation()
              handleStop()
            }}
          >
            ⏹️ 停止
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation()
              playAudio()
            }}
          >
            🔊 发音
          </Button>
        )}
      </div>

      {/* 错误提示 */}
      {playError && (
        <p className="text-red-500 text-sm text-center mt-2">{playError}</p>
      )}
    </div>
  )
}
