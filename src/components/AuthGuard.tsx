'use client';

import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

// 不需要登录的页面路径
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/callback'];

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, supabaseAvailable } = useAuth();

  // Supabase 未配置 → 直接放行（不做认证）
  if (!supabaseAvailable) {
    return <>{children}</>;
  }

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-elegant-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录 → 客户端重定向到登录页
  if (!user) {
    if (typeof window !== 'undefined' && !PUBLIC_PATHS.some(p => window.location.pathname.startsWith(p))) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
    return null;
  }

  return <>{children}</>;
}
