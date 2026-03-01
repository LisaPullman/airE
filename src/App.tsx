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
import { SuzhouFlightGamePage } from './games/suzhou-flight'

// import.meta.env.BASE_URL 由 Vite base 设置（生产构建为 /aire/，本地为 /）
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/'

function App() {
  return (
    <BrowserRouter basename={basename}>
      <Layout>
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
      </Layout>
    </BrowserRouter>
  )
}

export default App
