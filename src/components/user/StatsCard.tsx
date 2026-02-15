interface StatsCardProps {
  icon: string
  value: string | number
  label: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  purple: 'bg-purple-100 text-purple-600',
  red: 'bg-red-100 text-red-600'
}

export default function StatsCard({ icon, value, label, color }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 text-center shadow-sm">
      <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center mx-auto mb-2 text-2xl`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
