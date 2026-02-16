import { useState } from 'react'
import type { User } from '../../types'
import Button from '../common/Button'

interface SettingsFormProps {
  user: User
  onSave: (updates: Partial<UserSettings>) => void
}

interface UserSettings {
  nickname: string
  dailyGoal: number
  reminderEnabled: boolean
  reminderTime: string
}

const DAILY_GOAL_OPTIONS = [
  { value: 10, label: '10 分钟 (轻松)' },
  { value: 20, label: '20 分钟 (推荐)' },
  { value: 30, label: '30 分钟 (努力)' },
  { value: 60, label: '60 分钟 (强化)' },
]

export default function SettingsForm({ user, onSave }: SettingsFormProps) {
  const [settings, setSettings] = useState<UserSettings>({
    nickname: user.nickname,
    dailyGoal: 20,
    reminderEnabled: true,
    reminderTime: '20:00',
  })
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(settings)
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">学习设置</h3>
        {!isEditing && (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            编辑
          </Button>
        )}
      </div>

      {/* Nickname */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
        {isEditing ? (
          <input
            type="text"
            value={settings.nickname}
            onChange={(e) => setSettings({ ...settings, nickname: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aviation-light focus:border-transparent"
            maxLength={20}
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
            {settings.nickname}
          </div>
        )}
      </div>

      {/* Daily Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">每日学习目标</label>
        {isEditing ? (
          <select
            value={settings.dailyGoal}
            onChange={(e) => setSettings({ ...settings, dailyGoal: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aviation-light focus:border-transparent"
          >
            {DAILY_GOAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
            {DAILY_GOAL_OPTIONS.find(o => o.value === settings.dailyGoal)?.label}
          </div>
        )}
      </div>

      {/* Reminder */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">学习提醒</label>
        {isEditing ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSettings({ ...settings, reminderEnabled: !settings.reminderEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.reminderEnabled ? 'bg-aviation-light' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.reminderEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {settings.reminderEnabled ? '已开启' : '已关闭'}
            </span>
          </div>
        ) : (
          <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-800">
            {settings.reminderEnabled ? `每天 ${settings.reminderTime} 提醒` : '未开启'}
          </div>
        )}
      </div>

      {/* Reminder Time */}
      {isEditing && settings.reminderEnabled && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">提醒时间</label>
          <input
            type="time"
            value={settings.reminderTime}
            onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aviation-light focus:border-transparent"
          />
        </div>
      )}

      {/* Save Button */}
      {isEditing && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => setIsEditing(false)}
            className="flex-1"
          >
            取消
          </Button>
          <Button onClick={handleSave} className="flex-1">
            保存
          </Button>
        </div>
      )}

      {/* Saved Notice */}
      {saved && (
        <div className="text-center text-green-600 text-sm py-2 bg-green-50 rounded-lg">
          设置已保存
        </div>
      )}
    </div>
  )
}

export type { UserSettings }
