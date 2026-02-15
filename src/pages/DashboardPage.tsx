import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import StatsCard from '../components/user/StatsCard'
import ProgressBar from '../components/common/ProgressBar'
import { useUserStore } from '../stores/userStore'
import { useCourseStore } from '../stores/courseStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, goals } = useUserStore()
  const { modules } = useCourseStore()
  
  const totalVocab = modules.reduce((sum, m) => sum + (m.vocabularies?.length || 0), 0)
  const totalSentences = modules.reduce((sum, m) => sum + (m.sentences?.length || 0), 0)
  const activeGoals = goals.filter(g => g.status === 'active').length
  
  const weeklyData = [
    { day: '周一', progress: 80 },
    { day: '周二', progress: 60 },
    { day: '周三', progress: 100 },
    { day: '周四', progress: 40 },
    { day: '周五', progress: 90 },
    { day: '周六', progress: 70 },
    { day: '周日', progress: 50 }
  ]
  
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-aviation-blue">📊 学习仪表盘</h1>
        <p className="text-gray-600 mt-1">了解你的学习进度</p>
      </div>
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard icon="📖" value={totalVocab} label="总词汇量" color="blue" />
        <StatsCard icon="💬" value={totalSentences} label="总句型数" color="green" />
        <StatsCard icon="🎯" value={activeGoals} label="进行中目标" color="yellow" />
        <StatsCard icon="🔥" value={user?.streakDays || 0} label="连续天数" color="purple" />
      </div>
      
      {/* 周学习进度 */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">📅 本周学习进度</h3>
        <div className="flex justify-between gap-2">
          {weeklyData.map((day) => (
            <div key={day.day} className="flex-1 text-center">
              <div className="text-xs text-gray-500 mb-1">{day.day}</div>
              <div className="h-24 flex items-end justify-center gap-1">
                <div 
                  className="w-6 bg-aviation-light rounded-t transition-all"
                  style={{ height: `${day.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">{day.progress}%</div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* 模块完成度 */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">📚 模块完成度</h3>
        <div className="space-y-4">
          {modules.map((module) => {
            const moduleProgress = Math.floor(Math.random() * 100) // 模拟进度
            return (
              <div key={module.id}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{module.icon}</span>
                  <span className="font-medium">{module.name}</span>
                  <span className="text-sm text-gray-500">({moduleProgress}%)</span>
                </div>
                <ProgressBar 
                  value={moduleProgress} 
                  max={100} 
                  size="sm"
                  color={moduleProgress >= 100 ? 'green' : moduleProgress >= 50 ? 'blue' : 'yellow'}
                />
              </div>
            )
          })}
        </div>
      </Card>
      
      {/* 快速操作 */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">🚀 快速开始</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="primary" onClick={() => navigate('/modules')}>
            📖 学习课程
          </Button>
          <Button variant="success" onClick={() => navigate('/practice')}>
            ✍️ 开始练习
          </Button>
          <Button variant="warning" onClick={() => navigate('/goals')}>
            🎯 管理目标
          </Button>
          <Button variant="secondary" onClick={() => navigate('/achievements')}>
            🏆 查看成就
          </Button>
        </div>
      </Card>
      
      {/* 推荐模块 */}
      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-4">💡 推荐学习</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {modules.slice(0, 4).map((module) => (
            <div
              key={module.id}
              className="flex-shrink-0 w-40 p-4 bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl text-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/modules/${module.id}`)}
            >
              <div className="text-4xl mb-2">{module.icon}</div>
              <div className="font-bold text-gray-800">{module.name}</div>
              <div className="text-sm text-gray-500">
                {module.vocabularies?.length} 词汇
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
