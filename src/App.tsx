import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import ModulesPage from './pages/ModulesPage'
import ModuleDetailPage from './pages/learning/ModuleDetailPage'
import WeatherModulePage from './pages/learning/WeatherModule'
import PracticePage from './pages/PracticePage'
import QuizPage from './pages/practice/QuizPage'
import GoalsPage from './pages/goals/GoalsPage'
import AchievementsPage from './pages/AchievementsPage'
import ProfilePage from './pages/ProfilePage'
import { useCourseStore } from './stores/courseStore'

// 苏州飞行游戏依赖 three.js(体积大),按路由懒加载,不进主包
const SuzhouFlightGamePage = lazy(() =>
  import('./games/suzhou-flight').then((m) => ({ default: m.SuzhouFlightGamePage }))
)

// import.meta.env.BASE_URL 由 Vite base 设置（生产构建为 /aire/，本地为 /）
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

function App() {
  const loadFromServer = useCourseStore((s) => s.loadFromServer)

  // 启动时尝试从后端拉取课程数据,失败则保持内置数据
  useEffect(() => {
    void loadFromServer()
  }, [loadFromServer])

  return (
    <BrowserRouter basename={basename}>
      <Layout>
        <Suspense fallback={<div className="text-center py-12 text-gray-500">游戏加载中...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/modules/:moduleId" element={<ModuleDetailPage />} />
            <Route path="/modules/weather" element={<WeatherModulePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/practice/quiz" element={<QuizPage />} />
            <Route path="/games/suzhou-flight" element={<SuzhouFlightGamePage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}

export default App
