import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useCourseStore } from '../stores/courseStore'

export default function PracticePage() {
  const navigate = useNavigate()
  const { modules } = useCourseStore()

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-aviation-blue">✍️ 练习中心</h1>
        <p className="text-gray-600 mt-2">选择练习模式巩固你的学习成果</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card hover>
          <h3 className="text-xl font-bold text-gray-800">综合测验</h3>
          <p className="text-gray-600 mt-2">随机题目，60 秒完成 5 题。</p>
          <Button className="mt-4" onClick={() => navigate('/practice/quiz')}>
            开始测验
          </Button>
        </Card>

        <Card hover>
          <h3 className="text-xl font-bold text-gray-800">天气专项练习</h3>
          <p className="text-gray-600 mt-2">聚焦 M4 航空天气相关词汇与句型。</p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate('/modules/weather')}>
            进入天气模块
          </Button>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-bold text-gray-800 mb-3">按模块开始</h3>
        <div className="flex flex-wrap gap-2">
          {modules.map((module) => (
            <Button
              key={module.id}
              variant="secondary"
              onClick={() => navigate(`/practice/quiz?module=${module.id}`)}
            >
              {module.icon} {module.name}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
