import { CardGridSkeleton } from '@/components/skeleton'

export default function CasesLoading() {
  return (
    <div className="min-h-screen bg-elegant-gradient">
      {/* 导航占位 */}
      <div className="h-14 bg-white/80 border-b border-gray-200/50 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* 标题占位 */}
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
        {/* 筛选栏占位 */}
        <div className="flex gap-3 animate-pulse">
          <div className="h-9 w-24 bg-gray-100 rounded-lg" />
          <div className="h-9 w-28 bg-gray-100 rounded-lg" />
          <div className="h-9 w-20 bg-gray-100 rounded-lg" />
        </div>
        {/* 案例卡片 */}
        <CardGridSkeleton count={9} />
      </div>
    </div>
  )
}
