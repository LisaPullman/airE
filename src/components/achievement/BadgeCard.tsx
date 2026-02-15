interface BadgeCardProps {
  name: string
  icon: string
  description: string
  isEarned: boolean
  earnedAt?: Date
}

export default function BadgeCard({ name, icon, description, isEarned, earnedAt }: BadgeCardProps) {
  return (
    <div className={`p-4 rounded-xl text-center transition-all ${
      isEarned 
        ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300' 
        : 'bg-gray-100 border-2 border-gray-200 opacity-60'
    }`}>
      <div className="text-5xl mb-3">{isEarned ? icon : '🔒'}</div>
      <h4 className={`font-bold ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>
        {isEarned ? name : '???'}
      </h4>
      <p className={`text-sm mt-1 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
        {isEarned ? description : '完成条件后解锁'}
      </p>
      {isEarned && earnedAt && (
        <p className="text-xs text-gray-400 mt-2">
          获得于: {new Date(earnedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
