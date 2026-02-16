import { CloudIcon, PlaneIcon } from '../icons/AviationIcons'

// 云朵装饰组件
export function CloudDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <CloudIcon className="w-16 h-16 text-white opacity-80 animate-float" />
    </div>
  )
}

// 飞机装饰组件
export function PlaneDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <PlaneIcon className="w-12 h-12 text-aviation-sky animate-float" style={{ animationDelay: '0.5s' }} />
    </div>
  )
}

// 天空背景组件
export function SkyBackground({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 渐变天空背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-aviation-sky via-blue-100 to-white" />

      {/* 装饰性云朵 */}
      <div className="absolute top-4 left-10 opacity-60">
        <CloudIcon className="w-20 h-16 text-white animate-float" />
      </div>
      <div className="absolute top-12 right-16 opacity-50">
        <CloudIcon className="w-28 h-20 text-white animate-float" style={{ animationDelay: '1s' }} />
      </div>
      <div className="absolute top-8 right-1/3 opacity-40">
        <CloudIcon className="w-16 h-12 text-white animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* 小飞机装饰 */}
      <div className="absolute top-16 left-1/4 opacity-30">
        <PlaneIcon className="w-8 h-8 text-aviation-blue animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* 内容区域 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

// 课程模块卡片背景
export function ModuleCardBackground({ variant = 'blue' }: { variant?: 'blue' | 'pink' | 'mint' | 'peach' | 'lavender' }) {
  const variantStyles = {
    blue: 'from-blue-100 via-sky-50 to-blue-50',
    pink: 'from-pink-100 via-pink-50 to-rose-50',
    mint: 'from-teal-100 via-emerald-50 to-green-50',
    peach: 'from-orange-100 via-amber-50 to-yellow-50',
    lavender: 'from-purple-100 via-violet-50 to-indigo-50',
  }

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${variantStyles[variant]} rounded-3xl`} />
  )
}

// 进度条背景装饰
export function ProgressDecoration({ progress }: { progress: number }) {
  return (
    <div className="relative">
      {/* 飞机在进度条末端 */}
      {progress > 10 && (
        <div
          className="absolute -top-3 transform -translate-x-1/2 transition-all duration-500"
          style={{ left: `${progress}%` }}
        >
          <PlaneIcon className="w-6 h-6 text-aviation-blue transform -rotate-45" />
        </div>
      )}
    </div>
  )
}

// 星星评级组件
export function StarRating({ rating, maxRating = 3, size = 'md' }: { rating: number; maxRating?: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  return (
    <div className="flex gap-1">
      {Array.from({ length: maxRating }).map((_, index) => (
        <svg
          key={index}
          className={`${sizeClasses[size]} ${index < rating ? 'text-yellow-400' : 'text-gray-200'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )
}

// 飞行员等级徽章
export function PilotLevelBadge({ level, className = '' }: { level: number; className?: string }) {
  const levelColors = [
    'from-gray-400 to-gray-500',    // 1级 - 学员
    'from-blue-400 to-blue-500',    // 2级 - 初级
    'from-green-400 to-green-500',  // 3级 - 中级
    'from-yellow-400 to-yellow-500', // 4级 - 高级
    'from-purple-400 to-purple-500', // 5级 - 机长
    'from-amber-400 to-amber-500',  // 6级 - 资深机长
  ]

  const levelNames = ['学员', '初级', '中级', '高级', '机长', '资深机长']

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${levelColors[level - 1]} text-white font-bold text-sm shadow-md ${className}`}>
      <PlaneIcon className="w-4 h-4" />
      <span>{levelNames[level - 1]}</span>
    </div>
  )
}

// 翻转卡片组件（用于词汇学习）
export function FlipCard({ front, back, isFlipped, onFlip }: {
  front: React.ReactNode
  back: React.ReactNode
  isFlipped: boolean
  onFlip: () => void
}) {
  return (
    <div
      className="relative w-full h-48 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* 正面 */}
        <div className="absolute inset-0 backface-hidden">
          <div className="w-full h-full bg-white rounded-3xl shadow-clay border-4 border-aviation-sky p-6 flex flex-col items-center justify-center">
            {front}
          </div>
        </div>
        {/* 背面 */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full bg-gradient-to-br from-aviation-sky to-blue-200 rounded-3xl shadow-clay p-6 flex flex-col items-center justify-center text-white">
            {back}
          </div>
        </div>
      </div>
    </div>
  )
}

// 漂浮的装饰元素
export function FloatingDecorations() {
  return (
    <>
      {/* 漂浮的云朵 */}
      <div className="fixed top-20 left-5 opacity-30 pointer-events-none">
        <CloudIcon className="w-24 h-20 text-white animate-float" />
      </div>
      <div className="fixed top-32 right-10 opacity-20 pointer-events-none">
        <CloudIcon className="w-32 h-24 text-white animate-float" style={{ animationDelay: '2s' }} />
      </div>
      <div className="fixed top-48 left-1/3 opacity-25 pointer-events-none hidden md:block">
        <CloudIcon className="w-20 h-16 text-white animate-float" style={{ animationDelay: '4s' }} />
      </div>
    </>
  )
}
