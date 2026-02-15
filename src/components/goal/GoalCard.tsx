import Card from '../common/Card'
import Button from '../common/Button'
import ProgressBar from '../common/ProgressBar'
import type { Goal } from '../../types'

interface GoalCardProps {
  goal: Goal
  vocabCount?: number
  sentenceCount?: number
  onComplete?: (goalId: string) => void
  onAbandon?: (goalId: string) => void
  onClick?: () => void
}

export default function GoalCard({ 
  goal, 
  vocabCount = 0, 
  sentenceCount = 0,
  onComplete,
  onAbandon,
  onClick
}: GoalCardProps) {
  const progress = Math.min(((vocabCount + sentenceCount) / 10) * 100, 100)
  
  const statusColors = {
    active: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    abandoned: 'bg-gray-100 text-gray-800'
  }
  
  const statusLabels = {
    active: '进行中',
    completed: '已完成',
    abandoned: '已放弃'
  }
  
  return (
    <Card hover={!!onClick} className={onClick ? 'cursor-pointer' : ''} onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{goal.name}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[goal.status]}`}>
            {statusLabels[goal.status]}
          </span>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">目标分数</div>
          <div className="text-xl font-bold text-aviation-blue">{goal.targetScore}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <ProgressBar value={progress} max={100} label="完成进度" />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>词汇: {vocabCount}</span>
          <span>句型: {sentenceCount}</span>
        </div>
      </div>
      
      {goal.status === 'active' && (
        <div className="flex gap-2">
          {onComplete && (
            <Button size="sm" variant="success" onClick={(e) => {
              e.stopPropagation()
              onComplete(goal.id)
            }}>
              完成目标
            </Button>
          )}
          {onAbandon && (
            <Button size="sm" variant="secondary" onClick={(e) => {
              e.stopPropagation()
              onAbandon(goal.id)
            }}>
              放弃
            </Button>
          )}
        </div>
      )}
      
      {goal.status === 'completed' && (
        <div className="text-green-600 font-bold">
          🎉 目标已达成！
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-3">
        创建时间: {new Date(goal.createdAt).toLocaleDateString()}
      </div>
    </Card>
  )
}
