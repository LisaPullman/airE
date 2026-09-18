import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// mock 语音合成回退模块(避免依赖 window.speechSynthesis)
vi.mock('./speech', () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  stopSpeaking: vi.fn(),
}))

import { speak, stopSpeaking } from './speech'
import { audioUrl, playAudio, playAudioSequence, stopAudio } from './audio'

/** 可编程的 Audio 桩: 记录实例并由测试触发 onended/onerror */
class FakeAudio {
  static instances: FakeAudio[] = []
  src = ''
  paused = false
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  play = vi.fn().mockResolvedValue(undefined)
  pause = vi.fn(() => {
    this.paused = true
  })
  removeAttribute = vi.fn()

  constructor() {
    FakeAudio.instances.push(this)
  }
}

function lastAudio(): FakeAudio {
  return FakeAudio.instances[FakeAudio.instances.length - 1]
}

async function tick(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('audioUrl', () => {
  it('按约定拼接预生成音频路径', () => {
    expect(audioUrl('V1_word')).toBe('/audio/V1_word.mp3')
    expect(audioUrl('S3_zh')).toBe('/audio/S3_zh.mp3')
  })
})

describe('playAudio', () => {
  beforeEach(() => {
    FakeAudio.instances = []
    vi.stubGlobal('Audio', FakeAudio)
  })

  afterEach(() => {
    stopAudio()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('正常播放: 设置 src、调用 play、onended 后 resolve', async () => {
    const onEnd = vi.fn()
    const promise = playAudio('V1_word', { onEnd })

    const audio = lastAudio()
    expect(audio.src).toBe('/audio/V1_word.mp3')
    expect(audio.play).toHaveBeenCalled()

    audio.onended?.()
    await expect(promise).resolves.toBeUndefined()
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('音频加载失败时回退到 Web Speech 朗读', async () => {
    const promise = playAudio('MISSING_word', {
      fallbackText: 'wing',
      fallbackLang: 'en-US',
    })

    lastAudio().onerror?.()
    await expect(promise).resolves.toBeUndefined()
    expect(speak).toHaveBeenCalledWith('wing', 'en-US', undefined, undefined)
  })

  it('无回退文本且加载失败时 reject', async () => {
    const onError = vi.fn()
    const promise = playAudio('MISSING_word', { onError })

    lastAudio().onerror?.()
    await expect(promise).rejects.toThrow('音频加载失败')
    expect(onError).toHaveBeenCalledOnce()
  })

  it('浏览器阻止自动播放时 reject 且不触发回退', async () => {
    class BlockedAudio extends FakeAudio {
      play = vi.fn().mockRejectedValue(
        Object.assign(new Error('blocked'), { name: 'NotAllowedError' })
      )
    }
    vi.stubGlobal('Audio', BlockedAudio)

    const promise = playAudio('V1_word', { fallbackText: 'wing' })
    await expect(promise).rejects.toThrow('自动播放')
    expect(speak).not.toHaveBeenCalled()
  })

  it('stopAudio 暂停当前音频并停止语音合成', async () => {
    void playAudio('V1_word', { fallbackText: 'wing' })
    const audio = lastAudio()

    stopAudio()

    expect(audio.pause).toHaveBeenCalled()
    expect(audio.removeAttribute).toHaveBeenCalledWith('src')
    expect(stopSpeaking).toHaveBeenCalled()
  })
})

describe('playAudioSequence', () => {
  beforeEach(() => {
    FakeAudio.instances = []
    vi.stubGlobal('Audio', FakeAudio)
  })

  afterEach(() => {
    stopAudio()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('按顺序播放多条音频', async () => {
    const promise = playAudioSequence(
      [
        { name: 'V1_word', options: { fallbackText: 'wing' } },
        { name: 'V1_example', options: { fallbackText: 'The wing helps the plane fly.' } },
      ],
      10
    )

    // 第一段
    let audio = FakeAudio.instances[0]
    expect(audio.src).toBe('/audio/V1_word.mp3')
    audio.onended?.()
    await tick(20)

    // 第二段
    audio = FakeAudio.instances[1]
    expect(audio.src).toBe('/audio/V1_example.mp3')
    audio.onended?.()
    await expect(promise).resolves.toBeUndefined()
  })

  it('中途 stopAudio 取消后续步骤', async () => {
    const promise = playAudioSequence(
      [
        { name: 'V1_word', options: { fallbackText: 'wing' } },
        { name: 'V1_example', options: { fallbackText: 'The wing helps the plane fly.' } },
      ],
      10
    )

    FakeAudio.instances[0].onended?.()
    stopAudio()
    await expect(promise).resolves.toBeUndefined()
    // 只有第一段创建了音频
    expect(FakeAudio.instances).toHaveLength(1)
  })
})
