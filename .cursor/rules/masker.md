# Loading Masker - 智能 Loading 遮罩层库

> 一个基于 DOM 条件自动关闭的智能 Loading 覆盖层工具库。支持多种关闭条件、超时兜底、TypeScript 完整类型支持，适合 Cursor AI 辅助开发。

---

## 🎯 核心功能

在目标 DOM 节点上添加可控的 Loading 遮罩层，并根据以下**任一**条件自动关闭：

- ✅ **深度检查**：子树深度达到指定值
- ✅ **数量检查**：子节点数量达到指定数量  
- ✅ **选择器检查**：必要的 DOM 节点已存在
- ✅ **自定义检查**：自定义判断函数返回 true
- 🆕 **超时兜底**：达到最大时长自动关闭（防止永久遮挡）

---

## 📦 安装

```bash
npm install loading-masker
# or
pnpm add loading-masker
```

---

## 🚀 快速开始

### 基础用法

```ts
import { createMasker } from 'loading-masker'

const masker = createMasker({
  node: document.querySelector('#app')!,
  minNodes: 20,                    // 子节点数达到 20 个时关闭
  maxDuration: 5000,               // 5 秒后强制关闭（兜底）
  onTimeout: () => {
    console.warn('Loading 超时，已自动关闭')
  }
})

masker.show()
```

### 高级用法

```ts
import { createMasker } from 'loading-masker'

const masker = createMasker({
  node: document.querySelector('#root')!,
  
  // 主要条件配置（需要全部满足）
  maxDepth: 4,                           // 深度达到 4 层
  minNodes: 50,                          // 节点数达到 50 个
  requiredSelectors: ['.card', '.list'], // 必须存在的选择器
  // ↑ 以上三个条件需要同时满足才关闭（AND 关系）
  
  excludeSelectors: ['.ad', '#sidebar'], // 排除这些节点（不计入统计）
  customCheck: (root) => {               // 自定义判断（OR：满足即可关闭）
    return root.querySelectorAll('.item').length >= 10
  },
  
  // 超时兜底（强烈推荐配置）
  maxDuration: 8000,                     // 8 秒强制关闭
  onTimeout: () => {
    console.error('页面加载超时')
  },
  
  // 自定义渲染
  renderLoading: () => {
    const div = document.createElement('div')
    div.className = 'custom-spinner'
    div.innerHTML = '<span>加载中...</span>'
    return div
  },
  
  // 其他配置
  observe: true,                         // 是否自动监听 DOM（默认 true）
  throttleDelay: 300                     // 检查节流延迟（默认 200ms）
})

masker.show()

// 手动控制
setTimeout(() => masker.hide(), 3000)

// 完全销毁（清理监听器和定时器）
masker.destroy()
```

---

## 📚 API 文档

### `createMasker(options: MaskerOptions): MaskerInstance`

创建一个 Masker 实例。

#### **MaskerOptions**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `node` | `HTMLElement` | ✅ | - | 目标根节点 |
| `maxDepth` | `number` | - | - | 子树深度达到时关闭 |
| `minNodes` | `number` | - | - | 子节点数量达到时关闭 |
| `requiredSelectors` | `string[]` | - | - | 所有选择器匹配时关闭 |
| `excludeSelectors` | `string[]` | - | - | 排除的节点（不计入深度和数量统计） |
| `customCheck` | `(root: HTMLElement) => boolean` | - | - | 自定义判断函数 |
| `maxDuration` | `number` | - | - | 最大显示时长（ms），达到后强制关闭 |
| `onTimeout` | `() => void` | - | - | 超时回调函数 |
| `renderLoading` | `() => HTMLElement \| string` | - | - | 自定义 Loading 渲染 |
| `observe` | `boolean` | - | `true` | 是否自动监听 DOM 变化 |
| `throttleDelay` | `number` | - | `200` | 检查函数节流延迟（ms） |

#### **MaskerInstance**

| 方法 | 说明 |
|------|------|
| `show(): void` | 显示 Loading 遮罩层 |
| `hide(): void` | 隐藏 Loading 遮罩层 |
| `destroy(): void` | 销毁实例，清理监听器和定时器 |

---

## ⚙️ 工作流程

### 初始化流程

1. 参数校验（node 必须为有效 HTMLElement）
2. 创建 Loading 覆盖层并挂载到目标节点
3. 启动 MutationObserver（如果 `observe: true`）
4. 启动超时定时器（如果配置了 `maxDuration`）

### 条件检查流程

每次 DOM 变化时进行检查，条件逻辑如下：

1. 🔍 **主要条件组**（`maxDepth`、`minNodes`、`requiredSelectors`）
   - 如果配置了这些条件，需要**全部同时满足**才关闭（AND 关系）
   - 例如：配置了深度和数量，必须两者都达到才关闭
   - 例如：配置了深度、数量和选择器，必须三者都满足才关闭
2. 🔍 **自定义检查**（`customCheck`）- 满足即可关闭（OR）
3. ⏱️ **超时检查**（`maxDuration`）- 达到时强制关闭（OR）

### 关闭流程

1. 移除 Loading 覆盖层
2. 断开 MutationObserver
3. 清除超时定时器
4. 触发相应回调（如 `onTimeout`）

---

## 🏗️ 项目结构

```
masker/
├── src/
│   ├── core/
│   │   ├── observer.ts      # MutationObserver 封装
│   │   ├── checker.ts       # 条件检查逻辑
│   │   └── renderer.ts      # Loading 渲染器
│   ├── utils/
│   │   ├── dom.ts           # DOM 操作工具
│   │   ├── types.ts         # TypeScript 类型定义
│   │   └── throttle.ts      # 节流函数
│   ├── style.css            # 默认样式
│   └── index.ts             # 入口文件
├── package.json
└── tsdown.config.ts
```

---

## 🎨 样式自定义

### 默认样式

库提供默认的 Loading 样式，可通过 CSS 变量自定义：

```css
:root {
  --masker-bg: rgba(255, 255, 255, 0.9);
  --masker-color: #333;
  --masker-spinner-size: 40px;
}
```

### 完全自定义

通过 `renderLoading` 函数返回自定义元素：

```ts
renderLoading: () => {
  const div = document.createElement('div')
  div.style.cssText = `
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
  `
  div.innerHTML = '<div class="my-spinner"></div>'
  return div
}
```

---

## 🛡️ 类型安全

完整的 TypeScript 类型定义，开发时获得完整的类型提示和错误检查：

```ts
// ✅ 类型正确
const masker = createMasker({
  node: document.body,
  minNodes: 10
})

// ❌ 编译错误：node 必填
const masker2 = createMasker({
  minNodes: 10
})

// ❌ 编译错误：maxDepth 必须为 number
const masker3 = createMasker({
  node: document.body,
  maxDepth: '4'
})
```

---

## ⚡ 性能优化

### 已实现的优化

- ✅ 节流防抖：检查函数自动节流，避免频繁计算
- ✅ 高效算法：深度和数量计算使用迭代而非递归
- ✅ 智能监听：仅监听子树变化，忽略无关 DOM 修改
- ✅ 内存管理：`destroy()` 完全清理所有监听器和定时器

### 性能建议

- 🔸 优先使用 `requiredSelectors` 而非 `customCheck`（更高效）
- 🔸 合理设置 `throttleDelay`，避免过于频繁的检查
- 🔸 使用完毕后及时调用 `destroy()` 释放资源
- 🔸 建议始终配置 `maxDuration` 作为兜底

---

## 🔧 开发规范（Cursor AI 参考）

### 代码组织原则

1. **模块化**：每个功能独立文件，单一职责
2. **类型优先**：所有公开 API 必须有完整类型定义
3. **防御性编程**：参数校验、边界检查、异常处理
4. **性能意识**：避免递归、使用节流、及时清理资源

### 命名规范

- **文件名**：小写 + 短横线（如 `dom-utils.ts`）
- **类/接口**：大驼峰（如 `MaskerOptions`）
- **函数/变量**：小驼峰（如 `createMasker`）
- **常量**：大写下划线（如 `DEFAULT_THROTTLE_DELAY`）

### 注释规范

- 导出的函数/类必须有 JSDoc 注释
- 复杂逻辑添加行内注释说明意图
- 类型定义添加清晰的说明注释

### 错误处理

```ts
// ✅ 良好的错误处理
if (!options.node || !(options.node instanceof HTMLElement)) {
  throw new TypeError('node must be a valid HTMLElement')
}

// ✅ 提供有用的错误信息
if (options.maxDepth && options.maxDepth < 1) {
  throw new RangeError('maxDepth must be >= 1')
}
```

### 幂等性保证

```ts
// show/hide 多次调用应该是安全的
show() {
  if (this.isVisible) return
  // ...
}

hide() {
  if (!this.isVisible) return
  // ...
}
```

---

## 📋 实现 Checklist

### 核心功能
- [ ] `createMasker` 工厂函数
- [ ] `MaskerInstance` 类实现
- [ ] 条件检查器（Checker）
- [ ] DOM 观察器（Observer）
- [ ] Loading 渲染器（Renderer）

### 条件检查
- [ ] 深度检查（`maxDepth`）
- [ ] 数量检查（`minNodes`）
- [ ] 选择器检查（`requiredSelectors`）
- [ ] 自定义检查（`customCheck`）
- [ ] 超时检查（`maxDuration` + `onTimeout`）

### 工具函数
- [ ] DOM 深度计算
- [ ] DOM 节点计数
- [ ] 选择器匹配检查
- [ ] 节流函数
- [ ] 样式注入

### 质量保证
- [ ] TypeScript 类型完整
- [ ] 参数校验
- [ ] 错误处理
- [ ] 资源清理（destroy）
- [ ] 幂等性保证

### 文档和示例
- [ ] API 文档
- [ ] 使用示例
- [ ] 类型说明
- [ ] README.md

---

## 🎯 设计考虑点

### 1. **超时兜底的必要性** 🆕
- ❓ **问题**：如果条件永远不满足，Loading 会永久显示
- ✅ **解决**：添加 `maxDuration` 强制超时关闭
- ✅ **好处**：防止用户界面被永久遮挡，提升用户体验

### 2. **条件判断逻辑**
- 采用 **OR 逻辑**（任一条件满足即关闭）
- 按顺序检查，提前返回（性能优化）
- 所有条件都是可选的，至少应配置一个

### 3. **性能平衡**
- 使用节流避免频繁计算
- 深度/数量计算使用迭代算法
- MutationObserver 仅监听子树

### 4. **API 易用性**
- 参数命名直观（`maxDepth` vs `minNodes`）
- 支持字符串和 HTMLElement 两种渲染方式
- 提供合理的默认值

### 5. **健壮性**
- 参数合法性校验
- 多次调用幂等性
- 完整的资源清理

### 6. **扩展性**
- `customCheck` 允许任意自定义逻辑
- `renderLoading` 允许完全自定义 UI（内容会被统一包裹在 `#masker-loading` 容器中）
- 样式可通过 CSS 变量覆盖
- Loading 层使用固定 ID `#masker-loading`，确保被可靠排除

---

## 💡 使用场景

### SPA 应用首屏加载
```ts
import { createMasker } from 'loading-masker'

createMasker({
  node: document.querySelector('#app')!,
  minNodes: 30,
  maxDuration: 5000
})
```

### 动态内容加载
```ts
import { createMasker } from 'loading-masker'

createMasker({
  node: document.querySelector('.content')!,
  requiredSelectors: ['.article-title', '.article-body'],
  maxDuration: 3000
})
```

### 复杂组件渲染
```ts
import { createMasker } from 'loading-masker'

createMasker({
  node: document.querySelector('.dashboard')!,
  maxDepth: 5,
  minNodes: 100,
  requiredSelectors: ['.chart', '.table', '.stats'],
  maxDuration: 10000
})
```

---

## 📝 版本历史

### v1.0.0
- ✨ 初始版本发布
- ✨ 支持深度、数量、选择器、自定义检查
- ✨ 新增超时兜底机制（`maxDuration`）
- ✨ 完整 TypeScript 支持
- ✨ 性能优化（节流、迭代算法）



