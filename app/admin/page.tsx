'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Image, Heart, MessageSquare, TrendingUp, PlusCircle, ArrowRight } from 'lucide-react';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

interface DashboardStats {
  totalCases: number;
  totalImages: number;
  totalLikes: number;
  totalComments: number;
  recentCases: any[];
  caseTypeStats: { type: string; count: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session) {
      setIsAdmin(true);
      fetchDashboard();
    }
  }, []);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, result.token);
        setIsAdmin(true);
        fetchDashboard();
      } else {
        setAuthError(result.error || '密码错误');
      }
    } catch {
      setAuthError('验证失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/admin/cases');
      const result = await response.json();
      if (result.success) {
        const cases = result.data || [];

        // Calculate stats
        let totalImages = 0;
        let totalLikes = 0;
        let totalComments = 0;
        const typeMap: Record<string, number> = {};

        cases.forEach((c: any) => {
          if (Array.isArray(c.images)) totalImages += c.images.length;
          totalLikes += c.likes_count || 0;
          totalComments += c.reviews_count || 0;

          const type = c.case_type || '未分类';
          typeMap[type] = (typeMap[type] || 0) + 1;
        });

        const caseTypeStats = Object.entries(typeMap)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count);

        const recentCases = cases.slice(0, 5);

        setStats({ totalCases: cases.length, totalImages, totalLikes, totalComments, recentCases, caseTypeStats });
      }
    } catch (error) {
      console.error('加载 Dashboard 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔒</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">管理员验证</h1>
            <p className="text-sm text-slate-500 mt-1">请输入管理员密码</p>
          </div>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="输入管理员密码"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              disabled={authLoading}
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button onClick={handleLogin} disabled={authLoading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
              {authLoading ? '验证中...' : '验证'}
            </button>
            <button onClick={() => router.push('/')} className="w-full px-4 py-2 text-slate-500 hover:text-slate-700 text-sm">
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

  const statCards = [
    { label: '案例总数', value: stats.totalCases, icon: Building2, color: 'blue' },
    { label: '图片总数', value: stats.totalImages, icon: Image, color: 'emerald' },
    { label: '总点赞数', value: stats.totalLikes, icon: Heart, color: 'rose' },
    { label: '总评论数', value: stats.totalComments, icon: MessageSquare, color: 'amber' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">📊 管理后台</h1>
            <button onClick={() => router.push('/')} className="text-slate-400 hover:text-slate-600 text-sm">返回首页</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${color}-50 text-${color}-600`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Cases */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">最近案例</h2>
              <Link href="/admin/cases" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                查看全部 <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {stats.recentCases.length === 0 ? (
                <p className="p-4 text-sm text-slate-400">暂无案例</p>
              ) : (
                stats.recentCases.map((c: any) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate">{c.title}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        {c.case_type && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{c.case_type}</span>}
                        <span className="text-xs text-slate-400">❤️ {c.likes_count || 0}</span>
                        <span className="text-xs text-slate-400">💬 {c.reviews_count || 0}</span>
                      </div>
                    </div>
                    <button onClick={() => router.push(`/admin/cases/${c.id}`)} className="text-sm text-blue-600 hover:text-blue-700 ml-4">编辑</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Case Type Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">案例类型分布</h2>
            </div>
            <div className="p-4 space-y-3">
              {stats.caseTypeStats.length === 0 ? (
                <p className="text-sm text-slate-400">暂无数据</p>
              ) : (
                stats.caseTypeStats.map(({ type, count }) => (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 truncate">{type}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min((count / stats.totalCases) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/cases" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow flex items-center justify-between group">
            <div>
              <h3 className="font-semibold text-slate-900">案例管理</h3>
              <p className="text-sm text-slate-500 mt-1">管理、新增、编辑案例</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </Link>
          <Link href="/admin/smart-cases" className="bg-white rounded-lg shadow p-5 hover:shadow-md transition-shadow flex items-center justify-between group">
            <div>
              <h3 className="font-semibold text-slate-900">全网案例管理</h3>
              <p className="text-sm text-slate-500 mt-1">查看和管理全网抓取的案例</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
          </Link>
        </div>
      </div>
    </div>
  );
}
