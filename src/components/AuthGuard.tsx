'use client';

import { useAuth } from '@/context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';

// 完全公开的路径前缀
const FULLY_PUBLIC_PREFIXES = ['/auth', '/about', '/loading', '/not-found'];

function isPublicPath(pathname: string): boolean {
  if (pathname === '/' || pathname === '/cases') return true;
  if (FULLY_PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 监听自定义事件：页面组件请求登录弹窗
  useEffect(() => {
    const handler = () => setShowLoginModal(true);
    window.addEventListener('show-login-modal', handler);
    return () => window.removeEventListener('show-login-modal', handler);
  }, []);

  // 关键改动：公开页面不需要等 loading 完成，直接渲染
  // 这样首页、案例列表即使 Supabase 慢也能秒开
  if (isPublicPath(pathname)) {
    return (
      <>
        {children}
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </>
    );
  }

  // 以下是非公开路径的逻辑
  // Supabase 初始化中 → 显示 loading
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
