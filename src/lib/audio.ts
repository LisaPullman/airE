// 音频播放工具 - 优先播放 public/audio 下预生成的 TTS 音频，缺失时回退到 Web Speech API
// 音频由「TTS skill/gen_aire_audio.py」批量生成，命名约定见 audioUrl()
import { speak as speakFallback, stopSpeaking } from './speech'

let currentAudio: HTMLAudioElement | null = null
// 播代号：每次 stopAudio/新播放递增，用于中止进行中的播放序列
let playGeneration = 0

/** 预生成音频的 URL（遵循 Vite base path，兼容 /aire/ 等子路径部署） */
export function audioUrl(name: string): string {
  return `${import.meta.env.BASE_URL}audio/${name}.mp3`
}

export interface AudioPlayOptions {
  /** 音频文件缺失或不可用时，改用 Web Speech 朗读的回退文本 */
  fallbackText?: string
  fallbackLang?: 'en-US' | 'zh-CN'
  onEnd?: () => void
  onError?: (error: string) => void
}

/** 停止当前所有播放（音频 + 语音合成） */
export function stopAudio(): void {
  playGeneration++
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.removeAttribute('src')
    currentAudio = null
  }
  stopSpeaking()
}

/** 是否有音频正在播放 */
export function isAudioPlaying(): boolean {
  return currentAudio !== null && !currentAudio.paused
}

async function playOne(name: string, options: AudioPlayOptions, generation: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    currentAudio = audio
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      if (currentAudio === audio) currentAudio = null
      options.onEnd?.()
      resolve()
    }

    // 音频文件缺失/加载失败 -> 回退到 Web Speech
    const fallback = () => {
      if (settled) return
      if (generation !== playGeneration) {
        // 播放已被停止，静默结束
        settled = true
        resolve()
        return
      }
      settled = true
      if (currentAudio === audio) currentAudio = null
      if (options.fallbackText) {
        speakFallback(
          options.fallbackText,
          options.fallbackLang ?? 'en-US',
          options.onEnd,
          options.onError
        ).then(resolve, reject)
      } else {
        const error = `音频加载失败: ${name}`
        options.onError?.(error)
        reject(new Error(error))
      }
    }

    audio.onended = finish
    audio.onerror = fallback
    audio.src = audioUrl(name)
    audio.play().catch((err: DOMException) => {
      if (settled) return
      if (err?.name === 'NotAllowedError') {
        // 浏览器要求用户手势，直接报错而非回退
        settled = true
        if (currentAudio === audio) currentAudio = null
        const error = '浏览器阻止了自动播放，请点击播放按钮'
        options.onError?.(error)
        reject(new Error(error))
        return
      }
      fallback()
    })
  })
}

/** 播放单条预生成音频（自动停止之前的播放） */
export async function playAudio(name: string, options: AudioPlayOptions = {}): Promise<void> {
  stopAudio()
  return playOne(name, options, playGeneration)
}

export interface AudioSequenceStep {
  name: string
  options?: AudioPlayOptions
}

/** 按顺序播放多条音频，步与步之间留 gapMs 间隔；中途 stopAudio 会取消整个序列 */
export async function playAudioSequence(steps: AudioSequenceStep[], gapMs = 300): Promise<void> {
  stopAudio()
  const generation = playGeneration
  for (let i = 0; i < steps.length; i++) {
    if (generation !== playGeneration) return
    await playOne(steps[i].name, steps[i].options ?? {}, generation)
    if (i < steps.length - 1 && gapMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, gapMs))
    }
  }
}
