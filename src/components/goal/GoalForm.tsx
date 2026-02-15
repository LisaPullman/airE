import { useState } from 'react'
import Card from '../common/Card'
import Button from '../common/Button'
import { useCourseStore } from '../../stores/courseStore'
import type { Module } from '../../types'

interface GoalFormProps {
  onSubmit: (data: { name: string; moduleId: string | null; targetScore: number }) => void
  onCancel: () => void
}

export default function GoalForm({ onSubmit, onCancel }: GoalFormProps) {
  const { modules } = useCourseStore()
  const [name, setName] = useState('')
  const [moduleId, setModuleId] = useState<string | null>(null)
  const [targetScore, setTargetScore] = useState(80)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name, moduleId, targetScore })
  }
  
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-6">🎯 创建新目标</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            目标名称 *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：掌握Module 1所有词汇"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aviation-light focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            关联模块
          </label>
          <select
            value={moduleId || ''}
            onChange={(e) => setModuleId(e.target.value || null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aviation-light"
          >
            <option value="">不关联特定模块</option>
            {modules.map((module: Module) => (
              <option key={module.id} value={module.id}>
                {module.icon} {module.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            达标分数: {targetScore} 分
          </label>
          <input
            type="range"
            min="60"
            max="100"
            step="5"
            value={targetScore}
            onChange={(e) => setTargetScore(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>及格 (60)</span>
            <span>优秀 (100)</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            创建目标
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            取消
          </Button>
        </div>
      </form>
    </Card>
  )
}
