import { useState } from 'react'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import ProfileHeader from '../components/profile/ProfileHeader'
import AvatarSelector from '../components/profile/AvatarSelector'
import SettingsForm, { type UserSettings } from '../components/profile/SettingsForm'
import { useUserStore } from '../stores/userStore'

export default function ProfilePage() {
  const { user, isLoggedIn, login, logout, updateUser, updateAvatar } = useUserStore()
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)

  const handleLoginDemo = () => {
    login({
      id: 'u-demo',
      username: 'demo',
      nickname: '小飞行员',
      level: 1,
      exp: 320,
      streakDays: 3,
      badges: [{ id: 'b1', name: '初次起飞', icon: '🧑‍✈️', earnedAt: new Date().toISOString() }],
    })
  }

  const handleAvatarSelect = (avatar: string) => {
    updateAvatar(avatar)
  }

  const handleSettingsSave = (settings: Partial<UserSettings>) => {
    if (settings.nickname) {
      updateUser({ nickname: settings.nickname })
    }
  }

  const currentAvatar = user?.badges[0]?.icon || '🧑‍✈️'

  return (
    <div className="space-y-6 pb-8">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-aviation-blue">个人中心</h1>
        <p className="text-gray-500 text-sm mt-1">查看你的学习档案与学习数据</p>
      </div>

      {isLoggedIn && user ? (
        <>
          {/* Profile Header */}
          <ProfileHeader
            user={user}
            onAvatarClick={() => setShowAvatarSelector(true)}
          />

          {/* Learning Stats */}
          <Card>
            <h3 className="text-lg font-bold text-gray-800 mb-4">学习统计</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">📚</div>
                <div className="text-2xl font-bold text-aviation-blue">{user.level}</div>
                <div className="text-sm text-gray-500">完成模块</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">✅</div>
                <div className="text-2xl font-bold text-green-600">{Math.floor(user.exp / 100)}</div>
                <div className="text-sm text-gray-500">完成练习</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">🔥</div>
                <div className="text-2xl font-bold text-yellow-600">{user.streakDays}</div>
                <div className="text-sm text-gray-500">连续学习天数</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-1">🏆</div>
                <div className="text-2xl font-bold text-purple-600">{user.badges.length}</div>
                <div className="text-sm text-gray-500">获得徽章</div>
              </div>
            </div>
          </Card>

          {/* Settings */}
          <Card>
            <SettingsForm user={user} onSave={handleSettingsSave} />
          </Card>

          {/* Badges Preview */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">我的徽章</h3>
              <span className="text-sm text-gray-500">{user.badges.length} 个</span>
            </div>
            {user.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                    title={badge.name}
                  >
                    <span className="text-2xl">{badge.icon || '🏅'}</span>
                    <span className="text-sm text-gray-700">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">还没有获得徽章，继续学习吧！</p>
            )}
          </Card>

          {/* Logout */}
          <div className="pt-4">
            <Button variant="secondary" onClick={logout} className="w-full">
              退出登录
            </Button>
          </div>

          {/* Avatar Selector Modal */}
          {showAvatarSelector && (
            <AvatarSelector
              currentAvatar={currentAvatar}
              onSelect={handleAvatarSelect}
              onClose={() => setShowAvatarSelector(false)}
            />
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl">🧑‍✈️</div>
            <h2 className="text-xl font-bold text-gray-800">欢迎使用 airE</h2>
            <p className="text-gray-600">
              登录后可查看个人学习数据、设置学习目标、获得成就徽章。
            </p>
            <div className="pt-4">
              <Button onClick={handleLoginDemo} size="lg">
                一键登录演示账号
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              演示账号数据仅保存在本地浏览器中
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
