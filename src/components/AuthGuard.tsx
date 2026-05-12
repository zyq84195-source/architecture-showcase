'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface AuthGuardProps {
  children: ReactNode;
}

// 不需要登录的页面路径
const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/auth/callback'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(p => pathname?.startsWith(p));

  useEffect(() => {
    if (!loading && !user && !isPublic) {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(pathname || '/')}`;
    }
  }, [user, loading, isPublic, pathname]);

  // 已登录但访问登录页 → 跳转首页
  useEffect(() => {
    if (!loading && user && isPublic) {
      window.location.href = '/';
    }
  }, [user, loading, isPublic]);

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

  if (!user && !isPublic) {
    return null; // 等待重定向
  }

  return <>{children}</>;
}
