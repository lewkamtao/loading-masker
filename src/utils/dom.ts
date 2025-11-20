/**
 * 检查元素是否应该被排除
 */
function shouldExcludeElement(element: Element, excludeSelectors: string[]): boolean {
  // 确保 element 有 matches 方法（某些节点类型可能没有）
  if (!element.matches) {
    return false
  }
  
  try {
    return excludeSelectors.some(selector => element.matches(selector))
  }
  catch (error) {
    // 如果选择器无效，忽略错误
    return false
  }
}

/**
 * 计算 DOM 树的最大深度（迭代方式，避免递归栈溢出）
 * @param root 根节点
 * @param excludeSelectors 要排除的选择器列表（这些节点及其子节点不计入统计）
 */
export function calculateDepth(root: HTMLElement, excludeSelectors: string[] = []): number {
  let maxDepth = 0
  const queue: Array<{ node: Element; depth: number }> = [{ node: root, depth: 0 }]

  while (queue.length > 0) {
    const { node, depth } = queue.shift()!
    maxDepth = Math.max(maxDepth, depth)

    const children = node.children // 使用 children 而不是 childNodes（只包含元素节点）
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      
      // 检查是否应该排除此节点（如果排除，则不遍历其子节点）
      if (excludeSelectors.length > 0 && shouldExcludeElement(child, excludeSelectors)) {
        continue
      }
      
      queue.push({ node: child, depth: depth + 1 })
    }
  }

  return maxDepth
}

/**
 * 计算 DOM 树中的节点数量（仅元素节点，不包括根节点本身）
 * @param root 根节点
 * @param excludeSelectors 要排除的选择器列表（这些节点及其子节点不计入统计）
 */
export function countNodes(root: HTMLElement, excludeSelectors: string[] = []): number {
  let count = 0
  const queue: Element[] = []

  // 将根节点的直接子元素加入队列（不统计根节点本身）
  const children = root.children
  for (let i = 0; i < children.length; i++) {
    queue.push(children[i])
  }

  while (queue.length > 0) {
    const element = queue.shift()!
    
    // 检查是否应该排除此节点
    if (excludeSelectors.length > 0 && shouldExcludeElement(element, excludeSelectors)) {
      continue // 不计入此节点，也不遍历其子节点
    }
    
    count++

    // 将子元素加入队列
    const childElements = element.children
    for (let i = 0; i < childElements.length; i++) {
      queue.push(childElements[i])
    }
  }

  return count
}

/**
 * 检查所有选择器是否都能匹配到节点
 */
export function checkRequiredSelectors(
  root: HTMLElement,
  selectors: string[],
): boolean {
  return selectors.every(selector => root.querySelector(selector) !== null)
}

/**
 * 注入默认样式到文档
 */
export function injectDefaultStyles(): void {
  const styleId = 'masker-default-styles'

  // 避免重复注入
  if (document.getElementById(styleId)) {
    return
  }

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .masker-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--masker-bg, rgba(255, 255, 255, 0.9));
      color: var(--masker-color, #1a73e8);
      z-index: 9999;
      pointer-events: auto;
    }

    /* Material Design 风格的 spinner 容器 */
    .masker-spinner {
      width: var(--masker-spinner-size, 32px);
      height: var(--masker-spinner-size, 32px);
      animation: masker-rotate 2s linear infinite;
    }

    .masker-spinner svg {
      width: 100%;
      height: 100%;
      transform-origin: center;
    }

    .masker-spinner circle {
      stroke: currentColor;
      stroke-linecap: round;
      animation: masker-dash 1.5s ease-in-out infinite;
    }
    
    /* 确保 loading 容器始终被正确排除 */
    #masker-loading {
      position: absolute;
      inset: 0;
      z-index: 9999;
    }

    /* 整体旋转动画 */
    @keyframes masker-rotate {
      100% { 
        transform: rotate(360deg); 
      }
    }

    /* 圆弧长度变化动画（Material Design 风格）*/
    @keyframes masker-dash {
      0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
      }
    }
  `

  document.head.appendChild(style)
}

