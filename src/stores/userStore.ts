import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Goal, Badge } from '../types'

interface UserState {
  user: User | null
  isLoggedIn: boolean
  goals: Goal[]

  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateAvatar: (avatar: string) => void
  addGoal: (goal: Goal) => void
  updateGoal: (goalId: string, updates: Partial<Goal>) => void
  completeGoal: (goalId: string) => void
  addBadge: (badge: Badge) => void
  addExp: (amount: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      goals: [],
      
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),

      updateUser: (updates) => set((state) => {
        if (!state.user) return state
        return { user: { ...state.user, ...updates } }
      }),

      updateAvatar: (avatar) => set((state) => {
        if (!state.user) return state
        const badges = state.user.badges.length > 0
          ? [{ ...state.user.badges[0], icon: avatar }, ...state.user.badges.slice(1)]
          : [{ id: 'avatar', name: '头像', icon: avatar, earnedAt: new Date().toISOString() }]
        return { user: { ...state.user, badges } }
      }),

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
      })),
      
      updateGoal: (goalId, updates) => set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, ...updates } : g
        )
      })),
      
      completeGoal: (goalId) => set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId
            ? { ...g, status: 'completed' as const, completedAt: new Date() }
            : g
        )
      })),
      
      addBadge: (badge) => set((state) => {
        if (!state.user) return state
        return {
          user: {
            ...state.user,
            badges: [...state.user.badges, badge]
          }
        }
      }),
      
      addExp: (amount) => set((state) => {
        if (!state.user) return state
        const newExp = state.user.exp + amount
        const newLevel = Math.floor(newExp / 1000) + 1
        return {
          user: {
            ...state.user,
            exp: newExp,
            level: newLevel
          }
        }
      })
    }),
    {
      name: 'airE-user-storage'
    }
  )
)
