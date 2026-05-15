'use client';

import { useAuth } from '@/context/AuthContext';
import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoginModal from './LoginModal';

// 无需登录即可访问的路径
const PUBLIC_PATHS = ['/', '/about'];
const PUBLIC_PREFIXES = ['/auth', '/cases', '/loading', '/not-found'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
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

  // 公开页面直接渲染（首页、案例浏览、登录注册等）
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

  // 以下为受保护页面（搜索、收藏、管理等）

  // 初始化中 → 显示 loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录 → 显示登录弹窗，登录成功后自动渲染页面
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
