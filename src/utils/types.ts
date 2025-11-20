/**
 * Masker 配置选项
 */
export interface MaskerOptions {
  /** 必传：目标根节点 */
  node: HTMLElement

  /** 深度达到时关闭 */
  maxDepth?: number

  /** 节点数量达到时关闭 */
  minNodes?: number

  /** 所有选择器匹配节点存在时关闭 */
  requiredSelectors?: string[]

  /** 排除的选择器（这些节点及其子节点不计入深度和数量统计） */
  excludeSelectors?: string[]

  /** 自定义关闭判断 */
  customCheck?: (root: HTMLElement) => boolean

  /** 最大显示时长（毫秒），达到后强制关闭（兜底机制） */
  maxDuration?: number

  /** 超时回调函数 */
  onTimeout?: () => void

  /** 自定义 loading 渲染 */
  renderLoading?: () => HTMLElement | string

  /** 是否自动监听 DOM（默认 true） */
  observe?: boolean

  /** 检查函数节流延迟（毫秒，默认 200） */
  throttleDelay?: number
}

/**
 * Masker 实例接口
 */
export interface MaskerInstance {
  /** 显示 Loading 遮罩层 */
  show(): void

  /** 隐藏 Loading 遮罩层 */
  hide(): void

  /** 销毁实例，清理监听器和定时器 */
  destroy(): void
}

/**
 * 条件检查结果
 */
export interface CheckResult {
  /** 是否应该关闭 */
  shouldClose: boolean

  /** 满足的条件（用于调试） */
  reason?: string
}

