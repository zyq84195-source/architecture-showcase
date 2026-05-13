export default function SmartSearchLoading() {
  return (
    <div className="min-h-screen bg-elegant-gradient">
      <div className="h-14 bg-white/80 border-b border-gray-200/50 animate-pulse" />
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex gap-2 animate-pulse">
          <div className="h-8 w-20 bg-gray-100 rounded-full" />
          <div className="h-8 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-4 mt-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
