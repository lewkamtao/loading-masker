import type { MaskerInstance, MaskerOptions } from './utils/types'
import { Checker } from './core/checker'
import { Observer } from './core/observer'
import { Renderer } from './core/renderer'

// 导出类型
export type { MaskerInstance, MaskerOptions }

/**
 * Masker 实现类
 */
class Masker implements MaskerInstance {
  private options: MaskerOptions
  private renderer: Renderer
  private checker: Checker
  private observer: Observer | null = null
  private timeoutId: ReturnType<typeof setTimeout> | null = null

  constructor(options: MaskerOptions) {
    this.validateOptions(options)
    this.options = options

    // 初始化各模块
    this.renderer = new Renderer(options.node, options.renderLoading)
    this.checker = new Checker(options)

    // 如果开启观察，初始化 Observer
    if (options.observe !== false) {
      this.observer = new Observer(
        options.node,
        () => this.handleCheck(),
        options.throttleDelay,
      )
    }
  }

  /**
   * 显示 Loading 遮罩层
   */
  show(): void {
    if (this.renderer.isVisible()) {
      return // 幂等
    }

    this.renderer.show()

    // 启动观察器
    if (this.observer) {
      this.observer.start()
    }

    // 启动超时定时器（兜底机制）
    if (this.options.maxDuration && this.options.maxDuration > 0) {
      this.timeoutId = setTimeout(() => {
        this.handleTimeout()
      }, this.options.maxDuration)
    }

    // 立即检查一次条件
    this.handleCheck()
  }

  /**
   * 隐藏 Loading 遮罩层
   */
  hide(): void {
    if (!this.renderer.isVisible()) {
      return // 幂等
    }

    this.renderer.hide()

    // 停止观察器
    if (this.observer) {
      this.observer.stop()
    }

    // 清除超时定时器
    this.clearTimeout()
  }

  /**
   * 销毁实例，清理所有资源
   */
  destroy(): void {
    this.hide()

    // 彻底清理
    if (this.observer) {
      this.observer.stop()
      this.observer = null
    }

    this.clearTimeout()
  }

  /**
   * 处理条件检查
   */
  private handleCheck(): void {
    const result = this.checker.check()

    if (result.shouldClose) {
      // console.log('[Masker] Condition met:', result.reason)
      this.hide()
    }
  }

  /**
   * 处理超时
   */
  private handleTimeout(): void {
    // console.warn('[Masker] Timeout reached, force closing')
    this.hide()

    // 触发超时回调
    if (this.options.onTimeout) {
      try {
        this.options.onTimeout()
      }
      catch (error) {
        console.error('[Masker] onTimeout error:', error)
      }
    }
  }

  /**
   * 清除超时定时器
   */
  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
  }

  /**
   * 验证配置参数
   */
  private validateOptions(options: MaskerOptions): void {
    // node 必填且必须是 HTMLElement
    if (!options.node || !(options.node instanceof HTMLElement)) {
      throw new TypeError('[Masker] options.node must be a valid HTMLElement')
    }

    // maxDepth 必须 >= 1
    if (options.maxDepth !== undefined && options.maxDepth < 1) {
      throw new RangeError('[Masker] options.maxDepth must be >= 1')
    }

    // minNodes 必须 >= 1
    if (options.minNodes !== undefined && options.minNodes < 1) {
      throw new RangeError('[Masker] options.minNodes must be >= 1')
    }

    // maxDuration 必须 > 0
    if (options.maxDuration !== undefined && options.maxDuration <= 0) {
      throw new RangeError('[Masker] options.maxDuration must be > 0')
    }

    // requiredSelectors 不能为空数组
    if (options.requiredSelectors && options.requiredSelectors.length === 0) {
      throw new TypeError('[Masker] options.requiredSelectors cannot be an empty array')
    }

    // throttleDelay 必须 >= 0
    if (options.throttleDelay !== undefined && options.throttleDelay < 0) {
      throw new RangeError('[Masker] options.throttleDelay must be >= 0')
    }
  }
}

/**
 * 创建 Masker 实例
 *
 * @param options - 配置选项
 * @returns Masker 实例
 *
 * @example
 * ```ts
 * const masker = createMasker({
 *   node: document.querySelector('#app')!,
 *   minNodes: 20,
 *   maxDuration: 5000,
 *   onTimeout: () => console.warn('Loading timeout')
 * })
 *
 * masker.show()
 * ```
 */
export function createMasker(options: MaskerOptions): MaskerInstance {
  return new Masker(options)
}

// 默认导出
export default createMasker
