import { useState } from 'react'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import GoalCard from '../../components/goal/GoalCard'
import GoalForm from '../../components/goal/GoalForm'
import { useUserStore } from '../../stores/userStore'
import { useCourseStore } from '../../stores/courseStore'
import type { Goal } from '../../types'

export default function GoalsPage() {
  const { goals, addGoal, completeGoal, updateGoal } = useUserStore()
  const { modules } = useCourseStore()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  
  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.status === 'completed')
  
  const handleCreateGoal = (data: { name: string; moduleId: string | null; targetScore: number }) => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      userId: 'current-user',
      name: data.name,
      moduleId: data.moduleId || '',
      targetScore: data.targetScore,
      status: 'active',
      createdAt: new Date(),
      completedAt: undefined
    }
    addGoal(newGoal)
    setShowForm(false)
  }
  
  const handleComplete = (goalId: string) => {
    completeGoal(goalId)
  }
  
  const handleAbandon = (goalId: string) => {
    updateGoal(goalId, { status: 'abandoned' })
  }
  
  const getModuleVocabCount = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module?.vocabularies.length || 0
  }
  
  const getModuleSentenceCount = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    return module?.sentences.length || 0
  }
  
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-aviation-blue">🎯 学习目标</h1>
          <p className="text-gray-600 mt-1">设定目标，迈向成功</p>
        </div>
        <Button onClick={() => setShowForm(true)} variant="primary" className="w-full sm:w-auto">
          + 创建目标
        </Button>
      </div>
      
      {/* 创建目标表单 */}
      {showForm && (
        <GoalForm
          onSubmit={handleCreateGoal}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{activeGoals.length}</div>
          <div className="text-gray-600">进行中</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{completedGoals.length}</div>
          <div className="text-gray-600">已完成</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-400">{goals.length - activeGoals.length - completedGoals.length}</div>
          <div className="text-gray-600">已放弃</div>
        </Card>
      </div>
      
      {/* 筛选标签 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
          className="flex-1 min-w-20"
        >
          全部 ({goals.length})
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'secondary'}
          onClick={() => setFilter('active')}
          className="flex-1 min-w-20"
        >
          进行中 ({activeGoals.length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'secondary'}
          onClick={() => setFilter('completed')}
          className="flex-1 min-w-20"
        >
          已完成 ({completedGoals.length})
        </Button>
      </div>
      
      {/* 目标列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filter === 'all' && goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            vocabCount={goal.moduleId ? getModuleVocabCount(goal.moduleId) : 0}
            sentenceCount={goal.moduleId ? getModuleSentenceCount(goal.moduleId) : 0}
            onComplete={goal.status === 'active' ? handleComplete : undefined}
            onAbandon={goal.status === 'active' ? handleAbandon : undefined}
          />
        ))}
        
        {filter === 'active' && activeGoals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            vocabCount={goal.moduleId ? getModuleVocabCount(goal.moduleId) : 0}
            sentenceCount={goal.moduleId ? getModuleSentenceCount(goal.moduleId) : 0}
            onComplete={handleComplete}
            onAbandon={handleAbandon}
          />
        ))}
        
        {filter === 'completed' && completedGoals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            vocabCount={goal.moduleId ? getModuleVocabCount(goal.moduleId) : 0}
            sentenceCount={goal.moduleId ? getModuleSentenceCount(goal.moduleId) : 0}
          />
        ))}
      </div>
      
      {/* 空状态 */}
      {goals.length === 0 && (
        <Card className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">还没有目标</h3>
          <p className="text-gray-600 mb-4">创建一个学习目标，开始你的飞行之旅！</p>
          <Button onClick={() => setShowForm(true)} variant="primary">
            创建第一个目标
          </Button>
        </Card>
      )}
    </div>
  )
}
