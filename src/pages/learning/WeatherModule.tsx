import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import WeatherQuiz from '../../components/practice/WeatherQuiz'
import { useCourseStore } from '../../stores/courseStore'

export default function WeatherModule() {
  const [activeTab, setActiveTab] = useState<'vocab' | 'sentences' | 'quiz'>('vocab')
  const { getModuleById } = useCourseStore()
  const module = getModuleById('M4')

  if (!module) {
    return <div className="text-center py-10">天气模块不存在。</div>
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🌤️</div>
        <h1 className="text-3xl font-bold text-aviation-blue">航空天气</h1>
        <p className="text-gray-600 mt-2">了解天气对飞行的影响，掌握天气英语表达</p>
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          variant={activeTab === 'vocab' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('vocab')}
        >
          📖 词汇 ({module.vocabularies.length})
        </Button>
        <Button
          variant={activeTab === 'sentences' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('sentences')}
        >
          💬 句型 ({module.sentences.length})
        </Button>
        <Button
          variant={activeTab === 'quiz' ? 'success' : 'secondary'}
          onClick={() => setActiveTab('quiz')}
        >
          🧠 测验
        </Button>
      </div>

      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {module.vocabularies.map((vocab) => (
            <Card key={vocab.id} hover>
              <h3 className="text-xl font-bold text-aviation-blue">{vocab.word}</h3>
              <p className="text-lg text-gray-700">{vocab.translation}</p>
              <p className="text-sm text-gray-500 mt-1 italic">"{vocab.exampleSentence}"</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'sentences' && (
        <div className="space-y-4">
          {module.sentences.map((sentence) => (
            <Card key={sentence.id} hover>
              <p className="text-xl font-medium text-aviation-blue">{sentence.english}</p>
              <p className="text-lg text-gray-600">{sentence.chinese}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'quiz' && <WeatherQuiz />}
    </div>
  )
}
