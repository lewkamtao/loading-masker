import { throttle } from '../utils/throttle'

/**
 * DOM 观察器封装
 */
export class Observer {
  private observer: MutationObserver | null = null
  private targetNode: HTMLElement
  private callback: () => void
  private throttledCallback: () => void

  constructor(targetNode: HTMLElement, callback: () => void, throttleDelay: number = 200) {
    this.targetNode = targetNode
    this.callback = callback
    this.throttledCallback = throttle(callback, throttleDelay)
  }

  /**
   * 开始观察 DOM 变化
   */
  start(): void {
    if (this.observer) {
      return // 已经在观察
    }

    this.observer = new MutationObserver(() => {
      this.throttledCallback()
    })

    this.observer.observe(this.targetNode, {
      childList: true,
      subtree: true,
      attributes: false, // 不监听属性变化，性能优化
      characterData: false, // 不监听文本变化
    })
  }

  /**
   * 停止观察
   */
  stop(): void {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  /**
   * 检查是否正在观察
   */
  isObserving(): boolean {
    return this.observer !== null
  }
}

