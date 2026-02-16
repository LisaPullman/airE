// 语音合成工具 - 使用 Web Speech API

let currentUtterance: SpeechSynthesisUtterance | null = null

/**
 * 播放文本语音
 * @param text 要朗读的文本
 * @param lang 语言代码 ('en-US' | 'zh-CN')
 * @param onEnd 播放结束回调
 * @param onError 错误回调
 */
export function speak(
  text: string,
  lang: 'en-US' | 'zh-CN' = 'en-US',
  onEnd?: () => void,
  onError?: (error: string) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    // 检查浏览器支持
    if (!('speechSynthesis' in window)) {
      const error = '您的浏览器不支持语音合成功能'
      onError?.(error)
      reject(new Error(error))
      return
    }

    // 停止当前播放
    stopSpeaking()

    // 创建语音合成实例
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9  // 稍慢一点，便于学习
    utterance.pitch = 1
    utterance.volume = 1

    // 尝试选择合适的声音
    const voices = window.speechSynthesis.getVoices()
    const targetVoice = voices.find(
      (voice) => voice.lang.startsWith(lang.split('-')[0])
    )
    if (targetVoice) {
      utterance.voice = targetVoice
    }

    // 事件处理
    utterance.onend = () => {
      currentUtterance = null
      onEnd?.()
      resolve()
    }

    utterance.onerror = (event) => {
      currentUtterance = null
      const error = `语音播放失败: ${event.error}`
      onError?.(error)
      reject(new Error(error))
    }

    currentUtterance = utterance

    // 播放
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * 停止语音播放
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    currentUtterance = null
  }
}

/**
 * 暂停语音播放
 */
export function pauseSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause()
  }
}

/**
 * 恢复语音播放
 */
export function resumeSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume()
  }
}

/**
 * 检查是否正在播放
 */
export function isSpeaking(): boolean {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.speaking
  }
  return false
}

/**
 * 获取可用的声音列表
 */
export function getVoices(): SpeechSynthesisVoice[] {
  if ('speechSynthesis' in window) {
    return window.speechSynthesis.getVoices()
  }
  return []
}

/**
 * 初始化语音（预加载声音列表）
 */
export function initSpeech(): void {
  if ('speechSynthesis' in window) {
    // 某些浏览器需要先调用 getVoices 才能正常使用
    window.speechSynthesis.getVoices()

    // 声音列表可能是异步加载的
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices()
    }
  }
}
