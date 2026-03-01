import Card from '../components/common/Card'
import BadgeCard from '../components/achievement/BadgeCard'
import TitleProgress from '../components/achievement/TitleProgress'
import { useUserStore } from '../stores/userStore'

const defaultBadges = [
  { id: 'b1', name: '初次起飞', icon: '🛫', description: '完成第一次测验' },
  { id: 'b2', name: '词汇达人', icon: '📚', description: '累计学习 50 个词汇' },
  { id: 'b3', name: '坚持训练', icon: '🔥', description: '连续学习 7 天' },
]

const titles = [
  { level: 1, name: '实习飞行员', requiredExp: 0 },
  { level: 2, name: '副驾驶', requiredExp: 1000 },
  { level: 3, name: '机长', requiredExp: 2000 },
  { level: 4, name: '航空专家', requiredExp: 3500 },
]

export default function AchievementsPage() {
  const { user } = useUserStore()
  const earnedIds = new Set((user?.badges ?? []).map((b) => b.id))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-aviation-blue">🏆 成就中心</h1>
        <p className="text-gray-600 mt-2">解锁徽章，升级你的飞行称号</p>
      </div>

      <Card>
        <TitleProgress
          currentLevel={user?.level ?? 1}
          currentExp={user?.exp ?? 0}
          titles={titles}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {defaultBadges.map((badge) => {
          const userBadge = user?.badges.find((b) => b.id === badge.id)
          return (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              icon={badge.icon}
              description={badge.description}
              isEarned={earnedIds.has(badge.id)}
              earnedAt={userBadge?.earnedAt ? new Date(userBadge.earnedAt) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
