import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { useUserStore } from '../stores/userStore'

export default function ProfilePage() {
  const { user, isLoggedIn, login, logout, goals } = useUserStore()

  const handleLoginDemo = () => {
    login({
      id: 'u-demo',
      username: 'demo',
      nickname: '小飞行员',
      level: 1,
      exp: 320,
      streakDays: 3,
      badges: [{ id: 'b1', name: '初次起飞', icon: '🛫', earnedAt: new Date().toISOString() }],
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-aviation-blue">👤 个人中心</h1>
        <p className="text-gray-600 mt-2">查看你的学习档案与学习数据</p>
      </div>

      <Card>
        {isLoggedIn && user ? (
          <div className="space-y-3">
            <div className="text-5xl">🧑‍✈️</div>
            <div className="text-xl font-bold">{user.nickname}</div>
            <div className="text-gray-600">@{user.username}</div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <div className="font-bold text-lg">{user.level}</div>
                <div className="text-sm text-gray-500">等级</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{user.exp}</div>
                <div className="text-sm text-gray-500">经验</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{goals.length}</div>
                <div className="text-sm text-gray-500">目标数</div>
              </div>
            </div>
            <Button variant="secondary" onClick={logout}>退出登录</Button>
          </div>
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-gray-700">当前未登录，使用演示账号快速体验。</p>
            <Button onClick={handleLoginDemo}>一键登录演示账号</Button>
          </div>
        )}
      </Card>
    </div>
  )
}
