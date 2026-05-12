'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * 在页面组件中调用，未登录时自动跳转到登录页
 * 用法：在页面组件顶部调用 useRequireAuth()
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
    }
  }, [user, loading]);

  return { user, loading };
}
