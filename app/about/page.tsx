import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-elegant-gradient text-foreground">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Architecture Showcase</h1>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/cases">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  案例
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50">
                  搜索
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
                  关于
                </Button>
              </Link>
              <div className="w-px h-6 bg-gray-200 mx-2"></div>
              <Link href="/auth/register">
                <Button className="btn-primary-elegant">
                  注册
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" className="btn-secondary-elegant">
                  登录
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12">
        {/* 页面标题 */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-heading mb-4">
            关于我们
          </h1>
          <p className="text-body text-lg">
            Architecture Showcase - 优秀建筑案例展示平台
          </p>
        </div>

        {/* 平台介绍 */}
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="elegant-card p-8">
            <h2 className="text-2xl font-bold text-heading mb-4">
              平台简介
            </h2>
            <p className="text-body leading-relaxed">
              Architecture Showcase 是一个致力于展示优秀建筑案例的专业平台。
              我们精心收录了国内外经典的城市更新、文化保护、历史街区等项目，
              为建筑师、规划师、学生和爱好者提供丰富的设计灵感和专业参考。
            </p>
          </div>

          {/* 核心价值 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="elegant-card p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-heading mb-2">
                知识共享
              </h3>
              <p className="text-body text-sm">
                系统整理建筑案例，提供完整的项目信息和设计思路
              </p>
            </div>
            <div className="elegant-card p-6 text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-heading mb-2">
                设计灵感
              </h3>
              <p className="text-body text-sm">
                汇集优秀实践，激发设计创作和创新思维
              </p>
            </div>
            <div className="elegant-card p-6 text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-heading mb-2">
                可持续发展
              </h3>
              <p className="text-body text-sm">
                推广绿色建筑和可持续城市发展理念
              </p>
            </div>
          </div>

          {/* 平台特色 */}
          <div className="elegant-card p-8">
            <h2 className="text-2xl font-bold text-heading mb-6">
              平台特色
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-heading mb-1">精心筛选的案例</h3>
                  <p className="text-body text-sm">
                    每个案例都经过专业评审，确保信息准确和有价值
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-heading mb-1">丰富的图文资料</h3>
                  <p className="text-body text-sm">
                    提供高清图片、详细文字说明和完整的项目背景
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-heading mb-1">专业的分类体系</h3>
                  <p className="text-body text-sm">
                    按照城市更新、文化保护、社区更新等维度分类
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold">✓</span>
                <div>
                  <h3 className="font-bold text-heading mb-1">便捷的搜索功能</h3>
                  <p className="text-body text-sm">
                    支持关键词、类型、地区等多维度搜索
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* 数据统计 */}
          <div className="elegant-card p-8">
            <h2 className="text-2xl font-bold text-heading mb-6">
              平台数据
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-body text-sm">精选案例</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">44</div>
                <div className="text-body text-sm">高清图片</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">8</div>
                <div className="text-body text-sm">覆盖城市</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">16</div>
                <div className="text-body text-sm">结构化字段</div>
              </div>
            </div>
          </div>

          {/* 联系我们 */}
          <div className="elegant-card p-8 text-center">
            <h2 className="text-2xl font-bold text-heading mb-4">
              联系我们
            </h2>
            <p className="text-body mb-6">
              如果您有优秀案例想分享，或对平台有任何建议，欢迎联系我们
            </p>
            <Link href="mailto:contact@architecture-showcase.com">
              <Button className="btn-primary-elegant">
                发送邮件
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-body text-sm">
            <p>© 2026 Architecture Showcase. 建筑案例展示平台</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
