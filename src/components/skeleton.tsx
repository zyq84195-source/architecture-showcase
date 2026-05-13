export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
      {/* 图片占位 */}
      <div className="aspect-[4/3] bg-gray-200" />
      {/* 内容占位 */}
      <div className="p-5 space-y-3">
        {/* 标签 */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full" />
          <div className="h-5 w-20 bg-gray-200 rounded-full" />
        </div>
        {/* 标题 */}
        <div className="h-5 w-3/4 bg-gray-200 rounded" />
        {/* 描述 */}
        <div className="space-y-2">
          <div className="h-3.5 w-full bg-gray-100 rounded" />
          <div className="h-3.5 w-5/6 bg-gray-100 rounded" />
        </div>
        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3.5 w-24 bg-gray-100 rounded" />
          <div className="h-3.5 w-16 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-elegant-gradient animate-pulse">
      {/* 顶部导航 */}
      <div className="h-14 bg-white/80 border-b border-gray-200/50" />
      {/* 图片区 */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <div className="aspect-[16/9] bg-gray-200 rounded-2xl" />
      </div>
      {/* 内容区 */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* 标题 */}
        <div className="h-8 w-2/3 bg-gray-200 rounded" />
        {/* 标签 */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded-full" />
          <div className="h-6 w-20 bg-gray-100 rounded-full" />
          <div className="h-6 w-24 bg-gray-100 rounded-full" />
        </div>
        {/* 信息卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
        {/* 正文 */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 rounded" />
          <div className="h-4 w-4/6 bg-gray-100 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-3/4 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-elegant-gradient animate-pulse">
      {/* 导航栏 */}
      <div className="h-14 bg-white/80 border-b border-gray-200/50" />
      {/* Hero */}
      <div className="bg-gray-200 py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="h-6 w-40 bg-gray-300 rounded-full" />
          <div className="h-14 w-2/3 bg-gray-300 rounded" />
          <div className="h-5 w-1/2 bg-gray-300 rounded" />
          <div className="flex gap-3 mt-6">
            <div className="h-11 w-32 bg-gray-300 rounded-xl" />
            <div className="h-11 w-36 bg-gray-300 rounded-xl" />
          </div>
        </div>
      </div>
      {/* 案例网格 */}
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-8">
        <div className="h-8 w-40 bg-gray-200 rounded" />
        <CardGridSkeleton count={6} />
      </div>
    </div>
  )
}
