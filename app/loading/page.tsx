export default function Loading() {
  return (
    <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-elegant">
          <span className="text-white font-bold text-3xl">A</span>
        </div>
        <h1 className="text-2xl font-bold text-heading mb-4">
          Architecture Showcase
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-body text-lg">加载中...</span>
        </div>
      </div>
    </div>
  )
}
