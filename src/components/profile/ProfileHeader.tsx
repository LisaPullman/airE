import type { User } from '../../types'
import ProgressBar from '../common/ProgressBar'

interface ProfileHeaderProps {
  user: User
  onAvatarClick?: () => void
}

const AVATARS = ['🧑‍✈️', '👨‍✈️', '👩‍✈️', '🧕', '👲', '🧑', '👨', '👩']

// 航空英语等级称谓
const TITLES = [
  { level: 1, name: '飞行学员', requiredExp: 0 },
  { level: 2, name: '初级飞行员', requiredExp: 500 },
  { level: 3, name: '中级飞行员', requiredExp: 1500 },
  { level: 4, name: '高级飞行员', requiredExp: 3000 },
  { level: 5, name: '机长', requiredExp: 5000 },
  { level: 6, name: '资深机长', requiredExp: 8000 },
]

export default function ProfileHeader({ user, onAvatarClick }: ProfileHeaderProps) {
  const currentTitle = TITLES.find(t => t.level === user.level) || TITLES[0]
  const nextTitle = TITLES.find(t => t.level === user.level + 1)

  const expForCurrent = currentTitle.requiredExp
  const expForNext = nextTitle?.requiredExp || user.exp
  const expInLevel = user.exp - expForCurrent
  const expNeeded = expForNext - expForCurrent
  const progress = expNeeded > 0 ? Math.min((expInLevel / expNeeded) * 100, 100) : 100

  const avatar = user.badges[0]?.icon || AVATARS[0]

  return (
    <div className="bg-gradient-to-br from-aviation-blue to-aviation-light rounded-xl p-6 text-white">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <button
          onClick={onAvatarClick}
          className="text-5xl bg-white/20 rounded-full w-20 h-20 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
          title="点击更换头像"
        >
          {avatar}
        </button>

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold">{user.nickname}</h2>
          <p className="text-white/70 text-sm">@{user.username}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded">
              {currentTitle.name}
            </span>
            <span className="text-white/70 text-xs">Lv.{user.level}</span>
          </div>
        </div>

        {/* Streak */}
        <div className="text-center">
          <div className="text-2xl font-bold">{user.streakDays}</div>
          <div className="text-xs text-white/70">连续学习</div>
          <div className="text-lg">🔥</div>
        </div>
      </div>

      {/* Exp Progress */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>经验值: {user.exp}</span>
          {nextTitle ? (
            <span>下一级: {nextTitle.name}</span>
          ) : (
            <span>已满级</span>
          )}
        </div>
        <ProgressBar
          value={progress}
          max={100}
          color="yellow"
        />
        {nextTitle && (
          <p className="text-xs text-white/60 mt-1">
            还需 {expNeeded - expInLevel} 经验升级
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
        <div className="text-center">
          <div className="text-lg font-bold">{user.badges.length}</div>
          <div className="text-xs text-white/70">徽章</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{user.level}</div>
          <div className="text-xs text-white/70">等级</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{user.exp}</div>
          <div className="text-xs text-white/70">经验</div>
        </div>
      </div>
    </div>
  )
}

export { TITLES, AVATARS }
