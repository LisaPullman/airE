import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import { ModuleCard } from '../components/common/Card'
import { useCourseStore } from '../stores/courseStore'
import { useUserStore } from '../stores/userStore'
import {
  PlaneIcon,
  CloudIcon,
  TowerIcon,
  BookIcon,
  RocketIcon,
  StarIcon,
  ArrowRightIcon,
  PaperPlaneIcon,
} from '../components/icons/AviationIcons'

// 模块颜色配置
const moduleColors: Array<'blue' | 'pink' | 'mint' | 'peach' | 'lavender'> = [
  'blue', 'mint', 'peach', 'lavender', 'pink'
]

// 模块图标映射
const moduleIconMap: Record<string, React.ReactNode> = {
  'aircraft': <PlaneIcon className="w-12 h-12" />,
  'atc': <TowerIcon className="w-12 h-12" />,
  'weather': <CloudIcon className="w-12 h-12" />,
  'mission': <RocketIcon className="w-12 h-12" />,
  'emergency': <PlaneIcon className="w-12 h-12" />,
}

export default function HomePage() {
  const { modules } = useCourseStore()
  const { user } = useUserStore()
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen">
      {/* 天空背景 Hero 区域 */}
      <section className="relative overflow-hidden">
        {/* 渐变天空背景 */}
        <div className="absolute inset-0 bg-gradient-to-b from-aviation-sky via-blue-100 to-white" />

        {/* 装饰性云朵 */}
        <div className="absolute top-8 left-8 opacity-60 animate-float">
          <CloudIcon className="w-20 h-16 text-white" />
        </div>
        <div className="absolute top-16 right-12 opacity-50 animate-float" style={{ animationDelay: '1s' }}>
          <CloudIcon className="w-28 h-20 text-white" />
        </div>
        <div className="absolute top-6 right-1/3 opacity-40 animate-float" style={{ animationDelay: '2s' }}>
          <CloudIcon className="w-16 h-12 text-white" />
        </div>

        {/* 小飞机装饰 */}
        <div className="absolute top-20 left-1/4 opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>
          <PlaneIcon className="w-10 h-10 text-aviation-blue transform -rotate-12" />
        </div>
        <div className="absolute top-28 right-1/4 opacity-25 animate-float" style={{ animationDelay: '3s' }}>
          <PaperPlaneIcon className="w-8 h-8 text-aviation-dark transform rotate-12" />
        </div>

        {/* Hero 内容 */}
        <div className="relative z-10 px-6 py-16 text-center">
          {/* 飞机 Logo */}
          <div className="mb-6 animate-float">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white shadow-cloud">
              <PlaneIcon className="w-14 h-14 text-aviation-blue" />
            </div>
          </div>

          {/* 欢迎语 */}
          <h1 className="text-4xl md:text-5xl font-display font-bold text-aviation-navy mb-4 animate-takeoff">
            欢迎来到 airE
          </h1>
          <p className="text-xl text-aviation-dark mb-2 font-body animate-takeoff" style={{ animationDelay: '0.1s' }}>
            航空英语学习平台
          </p>
          <p className="text-gray-600 mb-8 font-body animate-takeoff" style={{ animationDelay: '0.2s' }}>
            和小飞行员们一起，探索航空英语的奇妙世界！
          </p>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-takeoff" style={{ animationDelay: '0.3s' }}>
            <Link to="/modules">
              <Button size="lg" icon={<RocketIcon className="w-6 h-6" />}>
                开始飞行学习
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary" icon={<StarIcon className="w-6 h-6" />}>
                查看进度
              </Button>
            </Link>
            <Link to="/games/suzhou-flight">
              <Button size="lg" variant="playful" icon={<PlaneIcon className="w-6 h-6" />}>
                苏州 3D 飞行
              </Button>
            </Link>
          </div>

          {/* 用户欢迎信息 */}
          {user && (
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-soft animate-takeoff" style={{ animationDelay: '0.4s' }}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aviation-sky to-blue-300 flex items-center justify-center">
                <PlaneIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-semibold text-aviation-dark">
                欢迎回来，小小飞行员！
              </span>
            </div>
          )}
        </div>

        {/* 波浪分隔线 */}
        <div className="relative h-12">
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 48" fill="none" preserveAspectRatio="none">
            <path
              d="M0 48h1440V24c-120 12-240 24-360 24s-240-12-360-24-240-24-360-24-240 12-360 24v24z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* 课程模块区域 */}
      <section className="px-4 py-8 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-playful-lemon rounded-full mb-4">
              <BookIcon className="w-5 h-5 text-amber-600" />
              <span className="font-display font-semibold text-amber-700">课程模块</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-aviation-navy mb-2">
              选择你的飞行任务
            </h2>
            <p className="text-gray-600">
              完成所有模块，成为真正的航空英语小达人！
            </p>
          </div>

          {/* 模块卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <ModuleCard
                key={module.id}
                icon={moduleIconMap[module.id] || <BookIcon className="w-12 h-12" />}
                title={module.name}
                description={module.description}
                progress={Math.floor(Math.random() * 100)}
                color={moduleColors[index % moduleColors.length]}
                onClick={() => navigate(`/modules/${module.id}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 特色功能区 */}
      <section className="px-4 py-12 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold text-aviation-navy mb-2">
              为什么选择 airE？
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 特色卡片 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-clay text-center hover:shadow-clay-lg hover:-translate-y-1 transition-all cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-aviation-sky to-blue-300 flex items-center justify-center">
                <RocketIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-aviation-navy mb-2">趣味学习</h3>
              <p className="text-sm text-gray-600">游戏化的学习方式，让学英语变得有趣</p>
            </div>

            {/* 特色卡片 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-clay text-center hover:shadow-clay-lg hover:-translate-y-1 transition-all cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-playful-mint to-teal-300 flex items-center justify-center">
                <StarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-aviation-navy mb-2">成就系统</h3>
              <p className="text-sm text-gray-600">收集徽章，升级飞行员等级</p>
            </div>

            {/* 特色卡片 3 */}
            <div className="bg-white rounded-3xl p-6 shadow-clay text-center hover:shadow-clay-lg hover:-translate-y-1 transition-all cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-playful-peach to-orange-300 flex items-center justify-center">
                <TowerIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display font-bold text-lg text-aviation-navy mb-2">专业内容</h3>
              <p className="text-sm text-gray-600">ICAO标准术语，专业航空英语</p>
            </div>
          </div>
        </div>
      </section>

      {/* 底部CTA */}
      <section className="px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-aviation-light to-aviation-blue rounded-3xl p-8 shadow-cloud text-white">
            <PlaneIcon className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-display font-bold mb-3">
              准备好起飞了吗？
            </h2>
            <p className="opacity-90 mb-6">
              加入我们，开启你的航空英语之旅！
            </p>
            <Link to="/modules">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-aviation-light hover:bg-blue-50"
                icon={<ArrowRightIcon className="w-5 h-5" />}
              >
                立即开始
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
