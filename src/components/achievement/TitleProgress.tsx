import ProgressBar from '../common/ProgressBar'

interface TitleProgressProps {
  currentLevel: number
  currentExp: number
  titles: { level: number; name: string; requiredExp: number }[]
}

export default function TitleProgress({ currentLevel, currentExp, titles }: TitleProgressProps) {
  const currentTitle = titles.find(t => t.level === currentLevel) || titles[0]
  const nextTitle = titles.find(t => t.level === currentLevel + 1)
  
  const expForCurrent = currentTitle?.requiredExp || 0
  const expForNext = nextTitle?.requiredExp || currentExp + 1000
  const expInLevel = currentExp - expForCurrent
  const expNeeded = expForNext - expForCurrent
  
  const progress = Math.min((expInLevel / expNeeded) * 100, 100)
  
  return (
    <div className="space-y-4">
      {/* 当前称号 */}
      <div className="text-center">
        <div className="text-6xl mb-2">🧑‍✈️</div>
        <h3 className="text-2xl font-bold text-aviation-blue">{currentTitle?.name}</h3>
        <p className="text-gray-600">等级 {currentLevel}</p>
      </div>
      
      {/* 进度条 */}
      {nextTitle && (
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>经验: {currentExp}</span>
            <span>下一级: {nextTitle.name} ({expForNext})</span>
          </div>
          <ProgressBar value={progress} max={100} label="距离下一级" color="yellow" />
          <p className="text-sm text-gray-500 mt-1">
            还需 {expNeeded - expInLevel} 经验值
          </p>
        </div>
      )}
      
      {/* 等级展示 */}
      <div className="flex justify-center items-center gap-2 mt-4">
        {titles.slice(0, 4).map((title) => (
          <div
            key={title.level}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              title.level <= currentLevel
                ? 'bg-aviation-light text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {title.level}
          </div>
        ))}
        {nextTitle && <span className="text-gray-400">...</span>}
      </div>
    </div>
  )
}
