import type { CheckResult, MaskerOptions } from '../utils/types'
import { calculateDepth, checkRequiredSelectors, countNodes } from '../utils/dom'

/**
 * 条件检查器
 */
export class Checker {
  private options: MaskerOptions
  private excludeSelectors: string[]

  constructor(options: MaskerOptions) {
    this.options = options
    
    // 构建排除选择器列表（始终排除 loading 容器）
    this.excludeSelectors = [
      '#masker-loading', // 统一的 loading 容器 ID
      ...(options.excludeSelectors || []),
    ]
  }

  /**
   * 执行所有条件检查
   * - maxDepth、minNodes、requiredSelectors 如果配置了，需要同时满足（AND）
   * - customCheck 满足即可关闭（OR）
   */
  check(): CheckResult {
    const { node } = this.options

    // 1. 深度、数量、选择器检查（AND 关系）
    const hasDepthConfig = this.options.maxDepth !== undefined
    const hasNodesConfig = this.options.minNodes !== undefined
    const hasSelectorsConfig = this.options.requiredSelectors && this.options.requiredSelectors.length > 0

    // 如果配置了深度、数量或选择器中的任意一个
    if (hasDepthConfig || hasNodesConfig || hasSelectorsConfig) {
      const conditions: string[] = []
      let allMet = true

      // 检查深度
      if (hasDepthConfig) {
        const depth = calculateDepth(node, this.excludeSelectors)
        const depthMet = depth >= this.options.maxDepth!
        conditions.push(`depth ${depth} ${depthMet ? '✓' : '✗'} ${this.options.maxDepth}`)
        if (!depthMet) allMet = false
      }

      // 检查数量
      if (hasNodesConfig) {
        const nodeCount = countNodes(node, this.excludeSelectors)
        const nodesMet = nodeCount >= this.options.minNodes!
        conditions.push(`nodes ${nodeCount} ${nodesMet ? '✓' : '✗'} ${this.options.minNodes}`)
        if (!nodesMet) allMet = false
      }

      // 检查必要选择器
      if (hasSelectorsConfig) {
        const allPresent = checkRequiredSelectors(node, this.options.requiredSelectors!)
        conditions.push(`selectors ${allPresent ? '✓' : '✗'}`)
        if (!allPresent) allMet = false
      }

      // 所有配置的条件都满足时才关闭
      if (allMet) {
        return {
          shouldClose: true,
          reason: `All conditions met: ${conditions.join(', ')}`,
        }
      }
    }

    // 2. 自定义检查（OR 关系，满足即可关闭）
    if (this.options.customCheck) {
      try {
        const result = this.options.customCheck(node)
        if (result) {
          return {
            shouldClose: true,
            reason: 'customCheck returned true',
          }
        }
      }
      catch (error) {
        console.error('[Masker] customCheck error:', error)
      }
    }

    return { shouldClose: false }
  }
}

