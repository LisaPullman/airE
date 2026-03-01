import { useNavigate } from 'react-router-dom'
import Card from '../components/common/Card'
import { useCourseStore } from '../stores/courseStore'

export default function ModulesPage() {
  const navigate = useNavigate()
  const { modules } = useCourseStore()
  
  const handleModuleClick = (moduleId: string) => {
    if (moduleId === 'M4') {
      navigate('/modules/weather')
      return
    }
    navigate(`/modules/${moduleId}`)
  }
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-aviation-blue">📚 课程模块</h1>
        <p className="text-gray-600 mt-2">选择你感兴趣的航空英语模块开始学习</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {modules.map((module) => (
          <Card 
            key={module.id} 
            hover 
            className="text-center cursor-pointer"
            onClick={() => handleModuleClick(module.id)}
          >
            <div className="text-6xl mb-4">{module.icon}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{module.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{module.description}</p>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>📖 {module.vocabularies.length} 词汇</span>
              <span>💬 {module.sentences.length} 句型</span>
            </div>
            {module.id === 'M4' && (
              <div className="mt-3 text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-block">
                🌟 新模块
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
