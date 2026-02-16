import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
  variant?: 'default' | 'clay' | 'gradient' | 'outlined'
  color?: 'white' | 'blue' | 'pink' | 'mint' | 'peach' | 'lavender'
}

const colorStyles = {
  white: 'bg-white',
  blue: 'bg-gradient-to-br from-blue-50 to-sky-100',
  pink: 'bg-gradient-to-br from-pink-50 to-rose-100',
  mint: 'bg-gradient-to-br from-teal-50 to-emerald-100',
  peach: 'bg-gradient-to-br from-orange-50 to-amber-100',
  lavender: 'bg-gradient-to-br from-purple-50 to-violet-100',
}

const variantStyles = {
  default: 'shadow-soft',
  clay: 'shadow-clay border-3 border-gray-100',
  gradient: 'shadow-cloud bg-gradient-to-br from-white to-blue-50',
  outlined: 'border-3 border-aviation-sky shadow-none',
}

export default function Card({
  children,
  className = '',
  hover = false,
  variant = 'clay',
  color = 'white',
  ...props
}: CardProps) {
  const baseColor = color === 'white' ? '' : colorStyles[color]
  const whiteBg = color === 'white' ? 'bg-white' : ''

  return (
    <div
      className={`
        rounded-3xl p-6
        ${whiteBg}
        ${baseColor}
        ${variantStyles[variant]}
        ${hover ? 'hover:shadow-clay-lg hover:-translate-y-1 cursor-pointer transition-all duration-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

// 小卡片组件（用于统计等）
export function StatCard({
  icon,
  value,
  label,
  color = 'blue',
}: {
  icon: ReactNode
  value: number | string
  label: string
  color?: 'blue' | 'pink' | 'mint' | 'peach' | 'lavender'
}) {
  const colorClasses = {
    blue: 'from-aviation-sky to-blue-200 text-aviation-dark',
    pink: 'from-playful-pink to-pink-200 text-pink-800',
    mint: 'from-playful-mint to-teal-200 text-teal-800',
    peach: 'from-playful-peach to-orange-200 text-orange-800',
    lavender: 'from-playful-lavender to-purple-200 text-purple-800',
  }

  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br ${colorClasses[color]} shadow-clay`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-display font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  )
}

// 模块卡片组件
export function ModuleCard({
  icon,
  title,
  description,
  progress,
  color = 'blue',
  onClick,
}: {
  icon: ReactNode
  title: string
  description: string
  progress?: number
  color?: 'blue' | 'pink' | 'mint' | 'peach' | 'lavender'
  onClick?: () => void
}) {
  const colorClasses = {
    blue: 'from-blue-100 via-sky-50 to-blue-50 hover:from-blue-200 hover:via-sky-100',
    pink: 'from-pink-100 via-rose-50 to-pink-50 hover:from-pink-200 hover:via-rose-100',
    mint: 'from-teal-100 via-emerald-50 to-teal-50 hover:from-teal-200 hover:via-emerald-100',
    peach: 'from-orange-100 via-amber-50 to-orange-50 hover:from-orange-200 hover:via-amber-100',
    lavender: 'from-purple-100 via-violet-50 to-purple-50 hover:from-purple-200 hover:via-violet-100',
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        rounded-3xl p-6
        bg-gradient-to-br ${colorClasses[color]}
        shadow-clay hover:shadow-clay-lg
        cursor-pointer
        transition-all duration-200
        hover:-translate-y-1
        group
      `}
    >
      {/* 进度环 */}
      {progress !== undefined && (
        <div className="absolute top-3 right-3 w-10 h-10">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-white opacity-50"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress} 100`}
              className="text-aviation-blue"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-aviation-dark">
            {progress}%
          </span>
        </div>
      )}

      {/* 图标 */}
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </div>

      {/* 标题 */}
      <h3 className="text-xl font-display font-bold text-aviation-navy mb-2">
        {title}
      </h3>

      {/* 描述 */}
      <p className="text-sm text-gray-600 leading-relaxed">
        {description}
      </p>

      {/* 底部箭头 */}
      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <svg className="w-5 h-5 text-aviation-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  )
}
