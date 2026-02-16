import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  DashboardIcon,
  BookIcon,
  TargetIcon,
  PencilIcon,
  TrophyIcon,
  UserIcon,
  PlaneIcon,
  CloudIcon,
} from '../icons/AviationIcons'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/', icon: HomeIcon, label: '首页' },
  { path: '/dashboard', icon: DashboardIcon, label: '仪表盘' },
  { path: '/modules', icon: BookIcon, label: '课程' },
  { path: '/goals', icon: TargetIcon, label: '目标' },
  { path: '/practice', icon: PencilIcon, label: '练习' },
  { path: '/achievements', icon: TrophyIcon, label: '成就' },
  { path: '/profile', icon: UserIcon, label: '我的' }
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* 顶部导航栏 */}
      <header className="sticky top-4 mx-4 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-cloud border border-white/50">
            <div className="px-4 py-3 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aviation-sky to-aviation-blue flex items-center justify-center shadow-clay group-hover:shadow-clay-lg transition-shadow">
                  <PlaneIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-display font-bold bg-gradient-to-r from-aviation-blue to-aviation-light bg-clip-text text-transparent">
                  airE
                </span>
              </Link>

              {/* 桌面端导航 */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl font-display font-medium
                        transition-all duration-200 cursor-pointer
                        ${isActive(item.path)
                          ? 'bg-gradient-to-r from-aviation-light to-aviation-blue text-white shadow-clay'
                          : 'text-gray-600 hover:bg-blue-50 hover:text-aviation-blue'
                        }
                      `}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* 用户头像 */}
              <Link
                to="/profile"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-playful-pink to-playful-peach flex items-center justify-center shadow-clay hover:shadow-clay-lg transition-shadow cursor-pointer"
              >
                <UserIcon className="w-5 h-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">
        {/* 装饰性云朵背景 */}
        <div className="fixed top-32 left-5 opacity-20 pointer-events-none animate-float">
          <CloudIcon className="w-24 h-20 text-aviation-sky" />
        </div>
        <div className="fixed top-48 right-10 opacity-15 pointer-events-none animate-float" style={{ animationDelay: '2s' }}>
          <CloudIcon className="w-32 h-24 text-aviation-sky" />
        </div>

        {children}
      </main>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-cloud border border-white/50">
          <div className="flex justify-around py-2">
            {navItems.slice(0, 5).map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                    transition-all duration-200 cursor-pointer
                    ${isActive(item.path)
                      ? 'text-aviation-light bg-blue-50'
                      : 'text-gray-400 hover:text-aviation-blue'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${isActive(item.path)
                      ? 'bg-gradient-to-br from-aviation-light to-aviation-blue text-white shadow-clay'
                      : ''
                    }
                  `}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
