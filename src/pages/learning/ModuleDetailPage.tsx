import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import VocabularyCard from '../../components/learning/VocabularyCard'
import SentenceCard from '../../components/learning/SentenceCard'
import { useCourseStore } from '../../stores/courseStore'

type TabType = 'vocab' | 'sentences'

export default function ModuleDetailPage() {
  const { moduleId } = useParams()
  const navigate = useNavigate()
  const { getFullModule } = useCourseStore()
  const [activeTab, setActiveTab] = useState<TabType>('vocab')

  const module = moduleId ? getFullModule(moduleId) : null

  if (!module) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">模块不存在</h2>
        <Button onClick={() => navigate('/modules')}>返回课程</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="secondary" onClick={() => navigate('/modules')}>
        ← 返回课程
      </Button>

      <div className="text-center py-6">
        <div className="text-6xl mb-4">{module.icon}</div>
        <h1 className="text-3xl font-bold text-aviation-blue">{module.name}</h1>
        <p className="text-gray-600 mt-2">{module.description}</p>
      </div>

      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{module.vocabularies.length}</div>
          <div className="text-gray-600">词汇</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{module.sentences.length}</div>
          <div className="text-gray-600">句型</div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
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
        <Button variant="success" onClick={() => navigate(`/practice/quiz?module=${module.id}`)}>
          ✍️ 开始练习
        </Button>
      </div>

      {activeTab === 'vocab' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {module.vocabularies.map((vocab, index) => (
            <VocabularyCard key={vocab.id} vocabulary={vocab} index={index} />
          ))}
        </div>
      )}

      {activeTab === 'sentences' && (
        <div className="space-y-4">
          {module.sentences.map((sentence, index) => (
            <SentenceCard key={sentence.id} sentence={sentence} index={index} />
          ))}
        </div>
      )}
    </div>
  )
}
