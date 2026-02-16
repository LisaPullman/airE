import { useNavigate } from 'react-router-dom'
import Card, { StatCard } from '../components/common/Card'
import Button from '../components/common/Button'
import ProgressBar from '../components/common/ProgressBar'
import { useUserStore } from '../stores/userStore'
import { useCourseStore } from '../stores/courseStore'
import {
  PlaneIcon,
  RocketIcon,
  TargetIcon,
  FireIcon,
  StarIcon,
  BookIcon,
  PencilIcon,
  TrophyIcon,
  ArrowRightIcon,
  LightningIcon,
  DashboardIcon,
} from '../components/icons/AviationIcons'
import { PilotLevelBadge, StarRating } from '../components/common/AviationDecorations'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, goals } = useUserStore()
  const { modules } = useCourseStore()

  const totalVocab = modules.reduce((sum, m) => sum + (m.vocabularies?.length || 0), 0)
  const totalSentences = modules.reduce((sum, m) => sum + (m.sentences?.length || 0), 0)
  const activeGoals = goals.filter(g => g.status === 'active').length

  const weeklyData = [
    { day: '周一', progress: 80, completed: true },
    { day: '周二', progress: 60, completed: false },
    { day: '周三', progress: 100, completed: true },
    { day: '周四', progress: 40, completed: false },
    { day: '周五', progress: 90, completed: true },
    { day: '周六', progress: 70, completed: false },
    { day: '周日', progress: 50, completed: false }
  ]

  return (
    <div className="space-y-6 animate-takeoff">
      {/* 页面标题区 */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 mb-2">
          <DashboardIcon className="w-8 h-8 text-aviation-blue" />
          <h1 className="text-3xl font-display font-bold text-aviation-navy">学习仪表盘</h1>
        </div>
        <p className="text-gray-600 font-body">了解你的学习进度，继续加油！</p>

        {/* 飞行员等级 */}
        <div className="mt-4 flex justify-center">
          <PilotLevelBadge level={user?.level || 1} />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookIcon className="w-6 h-6" />}
          value={totalVocab}
          label="总词汇量"
          color="blue"
        />
        <StatCard
          icon={<PlaneIcon className="w-6 h-6" />}
          value={totalSentences}
          label="总句型数"
          color="mint"
        />
        <StatCard
          icon={<TargetIcon className="w-6 h-6" />}
          value={activeGoals}
          label="进行中目标"
          color="peach"
        />
        <StatCard
          icon={<FireIcon className="w-6 h-6" />}
          value={user?.streakDays || 0}
          label="连续天数"
          color="pink"
        />
      </div>

      {/* 周学习进度 */}
      <Card variant="clay" color="white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-aviation-sky to-blue-300 flex items-center justify-center">
            <StarIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold text-aviation-navy">本周学习进度</h3>
        </div>

        <div className="flex justify-between gap-2">
          {weeklyData.map((day, index) => (
            <div key={day.day} className="flex-1 text-center">
              <div className="text-xs text-gray-500 mb-2 font-medium">{day.day}</div>
              <div className="h-24 flex items-end justify-center">
                <div
                  className={`w-8 rounded-t-xl transition-all duration-500 ${
                    day.completed
                      ? 'bg-gradient-to-t from-success to-green-300'
                      : 'bg-gradient-to-t from-aviation-sky to-blue-200'
                  }`}
                  style={{
                    height: `${day.progress}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2 font-medium">{day.progress}%</div>
              {day.completed && (
                <StarRating rating={3} size="sm" />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 模块完成度 */}
      <Card variant="clay" color="white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-playful-mint to-teal-300 flex items-center justify-center">
            <BookIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold text-aviation-navy">模块完成度</h3>
        </div>

        <div className="space-y-4">
          {modules.map((module, index) => {
            const moduleProgress = Math.floor(Math.random() * 100)
            const progressColors = ['blue', 'mint', 'peach', 'lavender', 'pink']

            return (
              <div
                key={module.id}
                className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-colors cursor-pointer"
                onClick={() => navigate(`/modules/${module.id}`)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                    index === 0 ? 'from-aviation-sky to-blue-300' :
                    index === 1 ? 'from-playful-mint to-teal-300' :
                    index === 2 ? 'from-playful-peach to-orange-300' :
                    index === 3 ? 'from-playful-lavender to-purple-300' :
                    'from-playful-pink to-pink-300'
                  } flex items-center justify-center shadow-clay`}>
                    <span className="text-white text-lg">{module.icon}</span>
                  </div>
                  <div className="flex-1">
                    <span className="font-display font-semibold text-aviation-navy">{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{moduleProgress}%</span>
                    {moduleProgress >= 100 && (
                      <TrophyIcon className="w-5 h-5 text-warning" />
                    )}
                  </div>
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
      <Card variant="gradient" color="white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning to-amber-300 flex items-center justify-center">
            <LightningIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-display font-bold text-aviation-navy">快速开始</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/modules')}
            icon={<BookIcon className="w-5 h-5" />}
          >
            学习课程
          </Button>
          <Button
            variant="success"
            onClick={() => navigate('/practice')}
            icon={<PencilIcon className="w-5 h-5" />}
          >
            开始练习
          </Button>
          <Button
            variant="warning"
            onClick={() => navigate('/goals')}
            icon={<TargetIcon className="w-5 h-5" />}
          >
            管理目标
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate('/achievements')}
            icon={<TrophyIcon className="w-5 h-5" />}
          >
            查看成就
          </Button>
        </div>
      </Card>

      {/* 推荐模块 */}
      <Card variant="clay" color="white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-playful-pink to-pink-300 flex items-center justify-center">
              <RocketIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-display font-bold text-aviation-navy">推荐学习</h3>
          </div>
          <button
            onClick={() => navigate('/modules')}
            className="flex items-center gap-1 text-aviation-blue hover:text-aviation-light transition-colors cursor-pointer"
          >
            <span className="text-sm font-medium">查看全部</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
          {modules.slice(0, 4).map((module, index) => {
            const bgColors = [
              'from-blue-100 to-sky-50',
              'from-teal-100 to-emerald-50',
              'from-orange-100 to-amber-50',
              'from-purple-100 to-violet-50',
            ]

            return (
              <div
                key={module.id}
                onClick={() => navigate(`/modules/${module.id}`)}
                className={`flex-shrink-0 w-40 p-5 bg-gradient-to-br ${bgColors[index % 4]} rounded-3xl text-center cursor-pointer hover:shadow-clay-lg hover:-translate-y-1 transition-all group`}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                <div className="font-display font-bold text-aviation-navy mb-1">{module.name}</div>
                <div className="text-sm text-gray-500">
                  {module.vocabularies?.length || 0} 词汇
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
