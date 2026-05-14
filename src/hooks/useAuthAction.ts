'use client';
import { useAuth } from '@/context/AuthContext';

/**
 * 用于首页等公开页面的功能按钮。
 * 如果用户已登录，执行 action；否则触发登录弹窗。
 */
export function useAuthAction() {
  const { user } = useAuth();

  function requireAuth(action: () => void) {
    if (user) {
      action();
    } else {
      window.dispatchEvent(new CustomEvent('show-login-modal'));
    }
  }

  return { user, requireAuth };
}
