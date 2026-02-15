import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import type { Vocabulary, Sentence } from '../../types'

interface WeatherModuleProps {
  vocabularies: Vocabulary[]
  sentences: Sentence[]
}

export default function WeatherModule({ vocabularies, sentences }: WeatherModuleProps) {
  const [activeTab, setActiveTab] = useState<'vocab' | 'sentences'>('vocab')
  
  return (
    <div className="space-y-6">
      {/* 模块标题 */}
      <div className="text-center py-6">
        <div className="text-6xl mb-4">🌤️</div>
        <h1 className="text-3xl font-bold text-aviation-blue">航空天气</h1>
        <p className="text-gray-600 mt-2">了解天气对飞行的影响，掌握天气英语表达</p>
      </div>
      
      {/* 标签切换 */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={activeTab === 'vocab' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('vocab')}
        >
          📖 词汇 ({vocabularies.length})
        </Button>
        <Button
          variant={activeTab === 'sentences' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('sentences')}
        >
          💬 句型 ({sentences.length})
        </Button>
      </div>
      
      {/* 词汇展示 */}
      {activeTab === 'vocab' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vocabularies.map((vocab) => (
            <Card key={vocab.id} hover>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                  ☁️
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-aviation-blue">{vocab.word}</h3>
                  <p className="text-lg text-gray-700">{vocab.translation}</p>
                  <p className="text-sm text-gray-500 mt-1 italic">"{vocab.exampleSentence}"</p>
                </div>
                <Button size="sm" variant="secondary">
                  🔊
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* 句型展示 */}
      {activeTab === 'sentences' && (
        <div className="space-y-4">
          {sentences.map((sentence) => (
            <Card key={sentence.id} hover>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-xl font-medium text-aviation-blue">{sentence.english}</p>
                  <p className="text-lg text-gray-600">{sentence.chinese}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    🔊 播放
                  </Button>
                  <Button size="sm" variant="primary">
                    🎤 跟读
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* 天气知识卡片 */}
      <Card className="bg-gradient-to-r from-blue-50 to-sky-50">
        <h3 className="text-xl font-bold text-aviation-blue mb-4">✈️ 飞行天气小知识</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">🌧️</div>
            <h4 className="font-bold">雨天飞行</h4>
            <p className="text-sm text-gray-600">雨天会影响能见度，飞行员需要更谨慎</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">💨</div>
            <h4 className="font-bold">风的影响</h4>
            <p className="text-sm text-gray-600">逆风增加爬升率，顺风则相反</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="font-bold">雷暴危险</h4>
            <p className="text-sm text-gray-600">雷暴天气必须绕飞，确保安全</p>
          </div>
          <div className="p-4 bg-white rounded-lg">
            <div className="text-2xl mb-2">🌫️</div>
            <h4 className="font-bold">大雾天气</h4>
            <p className="text-sm text-gray-600">低能见度时需要仪表着陆系统</p>
          </div>
        </div>
      </Card>
      
      {/* 开始练习按钮 */}
      <div className="text-center">
        <Button size="lg" variant="success">
          🚀 开始天气模块练习
        </Button>
      </div>
    </div>
  )
}
