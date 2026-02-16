import { Link } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useCourseStore } from '../stores/courseStore'

export default function HomePage() {
  const { modules } = useCourseStore()

  return (
    <div className="space-y-6">
      <section className="bg-gradient-to-r from-blue-100 to-sky-100 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-3">✈️</div>
        <h1 className="text-3xl font-bold text-aviation-blue">airE 航空英语学习平台</h1>
        <p className="text-gray-700 mt-2">面向小学生的趣味航空英语学习应用</p>
        <div className="mt-5">
          <Link to="/modules">
            <Button size="lg">开始学习</Button>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {modules.map((module) => (
          <Card key={module.id} hover className="text-center">
            <div className="text-5xl mb-2">{module.icon}</div>
            <h3 className="text-lg font-bold text-gray-800">{module.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{module.description}</p>
            <Link to={`/modules/${module.id}`} className="inline-block mt-4">
              <Button size="sm" variant="secondary">进入模块</Button>
            </Link>
          </Card>
        ))}
      </section>
    </div>
  )
}
