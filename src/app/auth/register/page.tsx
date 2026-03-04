'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    profession: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 验证
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密码至少6位')
      setLoading(false)
      return
    }

    // 模拟注册请求
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      // 这里应该调用API，暂时使用本地存储
      const users = JSON.parse(localStorage.getItem('users') || '[]')
      const newUser = {
        id: Date.now(),
        email: formData.email,
        name: formData.name,
        profession: formData.profession,
        createdAt: new Date().toISOString()
      }
      users.push(newUser)
      localStorage.setItem('users', JSON.stringify(users))
      localStorage.setItem('currentUser', JSON.stringify(newUser))
    }, 1000)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-elegant-gradient flex items-center justify-center">
        <div className="elegant-card p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-heading mb-2">
            注册成功
          </h1>
          <p className="text-body mb-6">
            欢迎加入 Architecture Showcase
          </p>
          <Link href="/">
            <Button className="btn-primary-elegant w-full">
              返回首页
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-elegant-gradient flex items-center justify-center py-12">
      <div className="elegant-card p-8 max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h1 className="text-2xl font-bold text-heading">创建账户</h1>
          <p className="text-body text-sm">加入 Architecture Showcase</p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              姓名
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="您的姓名"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 职业 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              职业
            </label>
            <select
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">请选择职业</option>
              <option value="architect">建筑师</option>
              <option value="planner">规划师</option>
              <option value="designer">设计师</option>
              <option value="student">学生</option>
              <option value="researcher">研究人员</option>
              <option value="other">其他</option>
            </select>
          </div>

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
              placeholder="至少6位字符"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="再次输入密码"
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

          {/* 注册按钮 */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full btn-primary-elegant"
          >
            {loading ? '注册中...' : '注册'}
          </Button>
        </form>

        {/* 登录链接 */}
        <div className="mt-6 text-center text-sm">
          <span className="text-body">已有账户？</span>
          <Link href="/auth/login" className="text-blue-600 hover:underline ml-1">
            登录
          </Link>
        </div>
      </div>
    </div>
  )
}
