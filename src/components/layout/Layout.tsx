import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

const navItems = [
  { path: '/', icon: '🏠', label: '首页' },
  { path: '/dashboard', icon: '📊', label: '仪表盘' },
  { path: '/modules', icon: '📚', label: '课程' },
  { path: '/goals', icon: '🎯', label: '目标' },
  { path: '/practice', icon: '✍️', label: '练习' },
  { path: '/achievements', icon: '🏆', label: '成就' },
  { path: '/profile', icon: '👤', label: '我的' }
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-xl font-bold text-aviation-blue">airE</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-aviation-light text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <Link to="/profile" className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            👤
          </Link>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 ${
                isActive(item.path)
                  ? 'text-aviation-light'
                  : 'text-gray-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
