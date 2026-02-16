interface ProgressBarProps {
  value: number
  max: number
  color?: 'blue' | 'green' | 'yellow' | 'red'
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
}

const sizeMap = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
}

export default function ProgressBar({
  value,
  max,
  color = 'blue',
  size = 'md',
  label,
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div>
      {label && (
        <div className="text-sm text-gray-600 mb-1">
          {label}: {Math.round(percent)}%
        </div>
      )}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div className={`${colorMap[color]} h-full transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
