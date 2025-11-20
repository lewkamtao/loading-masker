import type { MaskerOptions } from '../utils/types'
import { injectDefaultStyles } from '../utils/dom'

/**
 * Loading 渲染器
 */
export class Renderer {
  private overlay: HTMLElement | null = null
  private targetNode: HTMLElement
  private renderFn?: () => HTMLElement | string
  private theme: 'light' | 'dark'

  constructor(
    targetNode: HTMLElement,
    renderFn?: () => HTMLElement | string,
    theme: 'light' | 'dark' = 'light',
  ) {
    this.targetNode = targetNode
    this.renderFn = renderFn
    this.theme = theme
  }

  /**
   * 创建并显示 Loading 覆盖层
   */
  show(): void {
    if (this.overlay) {
      return // 已经显示，幂等
    }

    // 注入默认样式
    injectDefaultStyles()

    // 创建覆盖层
    this.overlay = this.createOverlay()

    // 设置目标节点为相对定位（如果不是）
    const position = window.getComputedStyle(this.targetNode).position
    if (position === 'static') {
      this.targetNode.style.position = 'relative'
    }

    // 挂载到目标节点
    this.targetNode.appendChild(this.overlay)
  }

  /**
   * 隐藏并移除 Loading 覆盖层
   */
  hide(): void {
    if (!this.overlay) {
      return // 已经隐藏，幂等
    }

    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay)
    }

    this.overlay = null
  }

  /**
   * 检查是否正在显示
   */
  isVisible(): boolean {
    return this.overlay !== null
  }

  /**
   * 创建覆盖层元素
   */
  private createOverlay(): HTMLElement {
    // 创建统一的容器，无论是默认还是自定义渲染都用这个容器包裹
    const container = document.createElement('div')
    container.id = 'masker-loading'
    container.className = `masker-overlay masker-theme-${this.theme}`
    container.setAttribute('data-masker-overlay', 'true')

    // 创建内容
    let content: HTMLElement

    if (this.renderFn) {
      const result = this.renderFn()

      if (typeof result === 'string') {
        // HTML 字符串
        const wrapper = document.createElement('div')
        wrapper.innerHTML = result
        content = wrapper.firstElementChild as HTMLElement || wrapper
      }
      else {
        // HTMLElement
        content = result
      }
    }
    else {
      // 使用默认 UI（SVG Material Design spinner）
      content = document.createElement('div')
      content.className = 'masker-spinner'
      content.innerHTML = `
        <svg viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
        </svg>
      `
    }

    // 将内容放入容器
    container.appendChild(content)

    return container
  }
}

