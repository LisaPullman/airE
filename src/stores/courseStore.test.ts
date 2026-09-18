import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Module } from '../types'

// courseStore 会在 import 时加载 api 模块,这里 mock 掉避免真实网络请求
vi.mock('../lib/api', () => ({
  fetchFullModules: vi.fn().mockRejectedValue(new Error('offline')),
}))

import { useCourseStore } from './courseStore'

describe('courseStore 内置课程数据', () => {
  beforeEach(() => {
    // 重置为初始 mock 数据(loadFromServer 失败路径)
    useCourseStore.setState({
      modules: useCourseStore.getInitialState().modules,
      currentModule: null,
      loadedFromServer: false,
    })
  })

  it('包含 M1-M5 五个模块', () => {
    const ids = useCourseStore.getState().modules.map((m) => m.id)
    expect(ids).toEqual(['M1', 'M2', 'M3', 'M4', 'M5'])
  })

  it('所有模块都有名称、描述、图标和内容', () => {
    for (const m of useCourseStore.getState().modules) {
      expect(m.name.length).toBeGreaterThan(0)
      expect(m.description.length).toBeGreaterThan(0)
      expect(m.vocabularies.length).toBeGreaterThan(0)
      expect(m.sentences.length).toBeGreaterThan(0)
    }
  })

  it('词汇 ID 全局唯一(音频文件按 ID 命名,重复会导致音频错配)', () => {
    const ids = useCourseStore
      .getState()
      .modules.flatMap((m) => m.vocabularies.map((v) => v.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('句型 ID 全局唯一', () => {
    const ids = useCourseStore
      .getState()
      .modules.flatMap((m) => m.sentences.map((s) => s.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('每个词汇都有单词、释义和例句(例句缺失会导致发音序列不完整)', () => {
    for (const v of useCourseStore.getState().modules.flatMap((m) => m.vocabularies)) {
      expect(v.word.length).toBeGreaterThan(0)
      expect(v.translation.length).toBeGreaterThan(0)
      expect(v.exampleSentence.length).toBeGreaterThan(0)
    }
  })

  it('每个句型都有英文和中文', () => {
    for (const s of useCourseStore.getState().modules.flatMap((m) => m.sentences)) {
      expect(s.english.length).toBeGreaterThan(0)
      expect(s.chinese.length).toBeGreaterThan(0)
    }
  })

  it('词汇 moduleId 归属于存在的模块', () => {
    const moduleIds = new Set(useCourseStore.getState().modules.map((m) => m.id))
    for (const v of useCourseStore.getState().modules.flatMap((m) => m.vocabularies)) {
      expect(moduleIds.has(v.moduleId)).toBe(true)
    }
  })

  it('getModuleById 按 ID 查找模块', () => {
    const m4 = useCourseStore.getState().getModuleById('M4')
    expect(m4?.name).toBe('航空天气')
    expect(useCourseStore.getState().getModuleById('M99')).toBeUndefined()
  })
})

describe('courseStore loadFromServer', () => {
  beforeEach(() => {
    useCourseStore.setState({
      modules: useCourseStore.getInitialState().modules,
      currentModule: null,
      loadedFromServer: false,
    })
  })

  it('后端不可用时保持内置数据且不抛错', async () => {
    await useCourseStore.getState().loadFromServer()
    const state = useCourseStore.getState()
    expect(state.loadedFromServer).toBe(false)
    expect(state.modules).toHaveLength(5)
  })

  it('后端返回数据时替换模块并标记 loadedFromServer', async () => {
    const serverModules: Module[] = [
      {
        id: 'M1',
        name: '服务端模块',
        description: '来自数据库',
        order: 1,
        icon: '✈️',
        vocabularies: [
          { id: 'V1', moduleId: 'M1', word: 'wing', translation: '机翼', exampleSentence: 'Wings lift the plane.' },
        ],
        sentences: [
          { id: 'S1', moduleId: 'M1', english: 'Hi.', chinese: '你好。' },
        ],
      },
    ]

    const { fetchFullModules } = await import('../lib/api')
    vi.mocked(fetchFullModules).mockResolvedValueOnce(serverModules)

    await useCourseStore.getState().loadFromServer()

    const state = useCourseStore.getState()
    expect(state.loadedFromServer).toBe(true)
    expect(state.modules).toEqual(serverModules)
  })
})
