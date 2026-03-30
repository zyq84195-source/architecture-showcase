# 集成计划：基础功能和 UI/UX 优化

**目标**：在不依赖 API Key 的情况下，完善集成的基础功能

---

## 📋 集成任务清单

### ✅ 阶段 1：API 路由优化（已完成）

- [x] 修复 TypeScript 语法错误
- [x] 添加双模式支持（full | search-only）
- [x] 改进错误处理
- [x] 添加特定错误提示（429、401 等）

**文件**：
- `src/app/api/web-search/route.ts`

---

### 🟡 阶段 2：搜索页面优化（进行中）

#### 2.1 添加搜索模式切换

**目标**：让用户可以选择是否使用 AI 模型

**实现**：
```tsx
// 添加搜索模式状态
const [searchApiMode, setSearchApiMode] = useState<'full' | 'search-only'>('search-only')

// 在 UI 中添加切换按钮
<div className="flex items-center gap-2 mb-4">
  <Button
    variant={searchApiMode === 'search-only' ? 'default' : 'outline'}
    onClick={() => setSearchApiMode('search-only')}
  >
    🔍 仅搜索（无 AI）
  </Button>
  <Button
    variant={searchApiMode === 'full' ? 'default' : 'outline'}
    onClick={() => setSearchApiMode('full')}
  >
    🤖 完整模式（含 AI）
  </Button>
</div>

// 修改 API 调用
const response = await fetch(
  `/api/web-search?q=${encodeURIComponent(webSearchTerm)}&mode=${searchApiMode}`
)
```

**文件**：
- `src/app/search/page.tsx`

---

#### 2.2 添加搜索模式提示

**目标**：让用户理解两种模式的区别

**实现**：
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
  <h3 className="font-semibold text-blue-900 mb-2">搜索模式说明</h3>
  <div className="space-y-2 text-sm">
    <div>
      <strong className="text-blue-700">🔍 仅搜索模式</strong>
      <p className="text-gray-700">快速搜索，不使用 AI 模型。适合快速查找案例。</p>
    </div>
    <div>
      <strong className="text-blue-700">🤖 完整模式</strong>
      <p className="text-gray-700">AI 智能分析，自动提取案例信息。需要配置有效的 API Key。</p>
    </div>
  </div>
</div>
```

**文件**：
- `src/app/search/page.tsx`

---

#### 2.3 优化错误提示 UI

**目标**：更友好的错误提示

**实现**：
```tsx
// 错误提示组件
{webError && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <span className="text-2xl">⚠️</span>
      <div className="flex-1">
        <h3 className="font-semibold text-red-900 mb-1">搜索失败</h3>
        <p className="text-red-700 mb-2">{webError}</p>
        {data.suggestion && (
          <p className="text-sm text-red-600 bg-red-100 rounded px-2 py-1">
            💡 建议：{data.suggestion}
          </p>
        )}
      </div>
    </div>
  </div>
)}
```

**文件**：
- `src/app/search/page.tsx`

---

#### 2.4 添加加载动画

**目标**：更好的用户体验

**实现**：
```tsx
{webIsSearching && (
  <div className="flex items-center justify-center py-12">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      <p className="text-gray-600">正在搜索中...</p>
    </div>
  </div>
)}
```

**文件**：
- `src/app/search/page.tsx`

---

### 🟢 阶段 3：测试和验证（待开始）

#### 3.1 启动开发服务器

```bash
cd architecture-showcase
npm run dev
```

#### 3.2 测试内部搜索

- [ ] 访问 http://localhost:3000/search
- [ ] 测试关键词搜索
- [ ] 测试类型筛选
- [ ] 测试地点筛选
- [ ] 验证搜索结果

#### 3.3 测试全网搜索（search-only 模式）

- [ ] 切换到"全网搜索"
- [ ] 选择"仅搜索模式"
- [ ] 输入搜索关键词
- [ ] 点击搜索
- [ ] 验证搜索结果
- [ ] 验证不依赖 AI 模型

#### 3.4 测试错误处理

- [ ] 测试空搜索
- [ ] 测试网络错误（断网）
- [ ] 验证错误提示是否友好
- [ ] 验证建议信息是否显示

---

### 🔵 阶段 4：文档和记录（待完成）

#### 4.1 更新集成进度文档

**文件**：
- `INTEGRATION_PROGRESS.md`

**更新内容**：
- 已完成的任务
- 当前进度
- 待完成的任务
- 问题记录

#### 4.2 创建测试报告

**文件**：
- `TEST_REPORT.md`

**内容**：
- 测试环境
- 测试用例
- 测试结果
- 发现的问题
- 改进建议

#### 4.3 更新 MEMORY.md

**内容**：
- 集成进展更新
- 关键决策记录
- 问题解决方案
- 经验总结

---

## 🎯 优先级排序

### 优先级 1（立即执行）

1. ✅ API 路由优化（已完成）
2. 🟡 搜索页面优化
   - 添加搜索模式切换
   - 添加搜索模式说明
   - 优化错误提示 UI

### 优先级 2（本周完成）

3. 添加加载动画
4. 测试内部搜索功能
5. 测试全网搜索（search-only 模式）

### 优先级 3（下周完成）

6. 测试错误处理
7. 更新集成进度文档
8. 创建测试报告

---

## 📝 注意事项

1. **不依赖 API Key**
   - 所有测试都使用 search-only 模式
   - 避免 429 错误

2. **向后兼容**
   - 保留完整模式（用于将来配置 API Key）
   - 默认使用 search-only 模式

3. **用户体验优先**
   - 清晰的模式说明
   - 友好的错误提示
   - 良好的加载动画

---

**下一步**：开始阶段 2，优化搜索页面
