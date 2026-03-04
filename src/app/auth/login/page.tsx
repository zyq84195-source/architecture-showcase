'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 模拟登录请求
    setTimeout(() => {
      setLoading(false)

      // 检查本地存储的用户
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const user = users.find((u: any) => u.email === formData.email)

      if (!user) {
        setError('邮箱不存在')
        return
      }

      // 简单的密码验证（实际应该使用哈希）
      if (formData.password.length < 6) {
        setError('密码错误')
        return
      }

      // 登录成功
      localStorage.setItem('currentUser', JSON.stringify(user))
      // 重定向到首页
      window.location.href = '/'
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-elegant-gradient flex items-center justify-center py-12">
      <div className="elegant-card p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-heading">欢迎回来</h1>
          <p className="text-body text-sm">登录到您的账户</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 邮箱 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="输入您的密码"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 记住我 & 忘记密码 */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300"
              />
              <span className="text-body">记住我</span>
            </label>
            <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
              忘记密码？
            </Link>
          </div>

          {/* 登录按钮 */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-elegant"
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>

        {/* 注册链接 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-body">还没有账户？</span>
          <Link href="/auth/register" className="text-blue-600 hover:underline ml-1">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  )
}
