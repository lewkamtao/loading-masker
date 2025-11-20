# Loading Masker

> 一个基于 DOM 条件自动关闭的智能 Loading 遮罩层工具库

[![npm version](https://img.shields.io/npm/v/loading-masker.svg)](https://www.npmjs.com/package/loading-masker)
[![License](https://img.shields.io/npm/l/loading-masker.svg)](https://github.com/yourusername/loading-masker/blob/main/LICENSE)

## ✨ 特性

- 🎯 **智能关闭** - 基于多种 DOM 条件自动关闭 Loading
- ⏱️ **超时兜底** - 支持最大时长限制，防止永久遮挡
- 🚫 **防闪屏** - 支持最小显示时长，避免加载过快导致闪屏
- 🎨 **主题模式** - 内置浅色/深色主题，适配不同场景
- 🖌️ **样式自定义** - 支持完全自定义 Loading UI
- 📦 **轻量级** - 零依赖，体积小巧
- 🔒 **类型安全** - 完整的 TypeScript 类型支持
- ⚡ **高性能** - 节流优化，避免频繁计算

## 📦 安装

```bash
npm install loading-masker
# or
pnpm add loading-masker
# or
yarn add loading-masker
```

## 🚀 快速开始

```ts
import { createMasker } from 'loading-masker'

// 创建实例
const masker = createMasker({
  node: document.querySelector('#app')!,
  minNodes: 20,          // 子节点达到 20 个时自动关闭
  maxDuration: 5000,     // 5 秒后强制关闭（兜底）
})

// 显示 Loading
masker.show()

// 手动隐藏（可选，满足条件会自动关闭）
// masker.hide()

// 销毁实例
// masker.destroy()
```

## 📚 API

### `createMasker(options: MaskerOptions): MaskerInstance`

创建一个 Masker 实例。

#### MaskerOptions

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `node` | `HTMLElement` | ✅ | - | 目标根节点 |
| `maxDepth` | `number` | - | - | 子树深度达到时关闭 |
| `minNodes` | `number` | - | - | 子节点数量达到时关闭 |
| `requiredSelectors` | `string[]` | - | - | 所有选择器匹配时关闭 |
| `excludeSelectors` | `string[]` | - | - | 排除的节点（不计入深度和数量统计） |
| `customCheck` | `(root: HTMLElement) => boolean` | - | - | 自定义判断函数 |
| `minDuration` | `number` | - | `300` | 最小显示时长（ms），防止闪屏 |
| `maxDuration` | `number` | - | - | 最大显示时长（ms），超时强制关闭 |
| `onTimeout` | `() => void` | - | - | 超时回调函数 |
| `renderLoading` | `() => HTMLElement \| string` | - | - | 自定义 Loading 渲染 |
| `theme` | `'light' \| 'dark'` | - | `'light'` | 主题模式：light 浅色、dark 深色 |
| `observe` | `boolean` | - | `true` | 是否自动监听 DOM |
| `throttleDelay` | `number` | - | `200` | 检查节流延迟（ms） |

#### MaskerInstance

| 方法 | 说明 |
|------|------|
| `show(): void` | 显示 Loading 遮罩层 |
| `hide(): void` | 隐藏 Loading 遮罩层 |
| `destroy(): void` | 销毁实例，清理资源 |

## 💡 使用场景

### SPA 首屏加载

```ts
const masker = createMasker({
  node: document.querySelector('#app')!,
  minNodes: 30,
  minDuration: 300,  // 最少显示 300ms，防止闪屏
  maxDuration: 5000,
  theme: 'light',     // 浅色主题
  onTimeout: () => {
    console.warn('首屏加载超时')
  }
})

masker.show()
```

### 深色主题模式

```ts
const masker = createMasker({
  node: document.querySelector('#app')!,
  minNodes: 20,
  theme: 'dark',      // 深色主题，适合暗色界面
  minDuration: 300,
  maxDuration: 5000
})

masker.show()
```

### 等待特定元素出现

```ts
import { createMasker } from 'loading-masker'

const masker = createMasker({
  node: document.querySelector('.content')!,
  requiredSelectors: ['.article-title', '.article-body'],
  maxDuration: 3000
})

masker.show()
```

### 复杂条件组合

```ts
import { createMasker } from 'loading-masker'

const masker = createMasker({
  node: document.querySelector('.dashboard')!,
  maxDepth: 5,
  minNodes: 100,
  requiredSelectors: ['.chart', '.table'],
  excludeSelectors: ['.ad-banner', '#sidebar'],  // 排除广告和侧边栏
  customCheck: (root) => {
    // 自定义逻辑：至少有 10 个数据项
    return root.querySelectorAll('.data-item').length >= 10
  },
  maxDuration: 10000,
  onTimeout: () => {
    console.error('仪表盘加载超时')
  }
})

masker.show()
```

### 自定义 Loading UI

```ts
import { createMasker } from 'loading-masker'

const masker = createMasker({
  node: document.querySelector('#app')!,
  minNodes: 20,
  renderLoading: () => {
    const div = document.createElement('div')
    div.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.7);
      color: white;
    `
    div.innerHTML = '<h2>加载中...</h2>'
    return div
  }
})

masker.show()
```

## 🎨 样式自定义

### 内置主题

内置两种主题模式，适配不同界面风格：

```ts
// 浅色主题（默认）
createMasker({
  node: document.querySelector('#app')!,
  theme: 'light'  // 白色半透明背景 + 蓝色图标
})

// 深色主题
createMasker({
  node: document.querySelector('#app')!,
  theme: 'dark'   // 黑色半透明背景 + 浅蓝色图标
})
```

### CSS 变量

覆盖默认样式变量：

```css
:root {
  /* 浅色主题 */
  --masker-bg: rgba(255, 255, 255, 0.9);
  --masker-color: #1a73e8;
  --masker-spinner-size: 40px;
}

/* 深色主题 */
.masker-theme-dark {
  --masker-bg: rgba(0, 0, 0, 0.85);
  --masker-color: #8ab4f8;
}
```

### 完全自定义

使用 `renderLoading` 函数返回自定义元素或 HTML 字符串。

**注意：** 无论是默认还是自定义 Loading，都会被统一包裹在一个 ID 为 `masker-loading` 的容器中，这个容器会自动从深度和数量统计中排除。

## ⚙️ 工作原理

1. **监听 DOM 变化** - 使用 `MutationObserver` 监听目标节点的子树变化
2. **条件检查** - 每次 DOM 变化时检查配置的条件（节流优化）
3. **智能关闭** - 根据条件逻辑自动隐藏 Loading：
   - `maxDepth`、`minNodes`、`requiredSelectors` 如果配置了，需要**全部同时满足**（AND）
   - `customCheck` 满足即关闭（OR）
4. **防闪屏机制** - 最小显示时长（默认 300ms），避免加载过快导致视觉闪烁
5. **超时兜底** - 达到最大时长强制关闭，防止永久遮挡

**条件逻辑示例：**
```ts
// 只配置深度 → 深度达到即关闭
createMasker({ node, maxDepth: 4 })

// 只配置数量 → 数量达到即关闭  
createMasker({ node, minNodes: 20 })

// 同时配置深度和数量 → 两者都要满足才关闭
createMasker({ node, maxDepth: 4, minNodes: 20 })

// 配置深度、数量和选择器 → 三者都要满足才关闭
createMasker({ 
  node, 
  maxDepth: 4,                      // 必须满足
  minNodes: 20,                     // 必须满足
  requiredSelectors: ['.ready']     // 必须满足
})

// 使用 customCheck → 满足即可关闭（不管其他条件）
createMasker({ 
  node,
  maxDepth: 4,                      // 需要同时满足
  minNodes: 20,                     // 需要同时满足
  customCheck: (root) => {          // OR: 满足即可关闭
    return root.querySelector('.loaded') !== null
  }
})
```

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# Lint
pnpm lint
```

## 📄 License

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

