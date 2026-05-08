import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
      <div className="text-center max-w-md px-6 animate-fade-in">
        <div className="text-8xl mb-6">🔍</div>
        <h1 className="text-4xl font-bold text-heading mb-4">
          页面未找到
        </h1>
        <p className="text-body text-lg mb-8">
          抱歉，您访问的页面不存在或已被删除。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="btn-primary-elegant">
              返回首页
            </Button>
          </Link>
          <Link href="/cases">
            <Button variant="outline" className="btn-secondary-elegant">
              浏览案例
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
