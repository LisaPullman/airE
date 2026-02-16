import { useState } from 'react'
import Button from '../common/Button'

interface AvatarSelectorProps {
  currentAvatar: string
  onSelect: (avatar: string) => void
  onClose: () => void
}

const AVATARS = [
  { emoji: '🧑‍✈️', name: '飞行员' },
  { emoji: '👨‍✈️', name: '男飞行员' },
  { emoji: '👩‍✈️', name: '女飞行员' },
  { emoji: '🧕', name: '空乘' },
  { emoji: '👲', name: '机长' },
  { emoji: '🧑', name: '学员' },
  { emoji: '👨', name: '男士' },
  { emoji: '👩', name: '女士' },
  { emoji: '🦸', name: '英雄' },
  { emoji: '🧙', name: '法师' },
  { emoji: '🤠', name: '牛仔' },
  { emoji: '😎', name: '酷' },
]

export default function AvatarSelector({ currentAvatar, onSelect, onClose }: AvatarSelectorProps) {
  const [selected, setSelected] = useState(currentAvatar)

  const handleConfirm = () => {
    onSelect(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-aviation-blue mb-4">选择头像</h3>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.emoji}
              onClick={() => setSelected(avatar.emoji)}
              className={`text-3xl p-3 rounded-lg transition-all ${
                selected === avatar.emoji
                  ? 'bg-aviation-light text-white scale-110 shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              title={avatar.name}
            >
              {avatar.emoji}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 mb-4 py-3 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">当前选择:</span>
          <span className="text-4xl">{selected}</span>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            确认
          </Button>
        </div>
      </div>
    </div>
  )
}

export { AVATARS }
