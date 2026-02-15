import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ModulesPage from './pages/ModulesPage'
import WeatherModulePage from './pages/learning/WeatherModule'
import PracticePage from './pages/PracticePage'
import AchievementsPage from './pages/AchievementsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/modules/weather" element={<WeatherModulePage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
