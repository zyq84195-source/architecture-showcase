'use client';

import { useAuth } from '@/context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';

// 完全公开的路径前缀
const FULLY_PUBLIC_PREFIXES = ['/auth', '/about', '/loading', '/not-found'];

function isPublicPath(pathname: string): boolean {
  // 精确匹配
  if (pathname === '/' || pathname === '/cases') return true;
  // 前缀匹配
  if (FULLY_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading, supabaseAvailable } = useAuth();
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 监听自定义事件：页面组件请求登录弹窗
  useEffect(() => {
    const handler = () => setShowLoginModal(true);
    window.addEventListener('show-login-modal', handler);
    return () => window.removeEventListener('show-login-modal', handler);
  }, []);

  // Supabase 未配置 → 直接放行
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

  const isPublic = isPublicPath(pathname);

  // 公开页面：直接放行
  if (isPublic) {
    return (
      <>
        {children}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  // 受保护页面：未登录显示登录弹窗
  if (!user) {
    return <LoginModal onClose={() => window.history.back()} />;
  }

  return (
    <>
      {children}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
