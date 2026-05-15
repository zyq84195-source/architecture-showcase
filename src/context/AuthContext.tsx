'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  supabaseAvailable: boolean;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (username: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseAvailable] = useState(() => !!supabase);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return;
    try {
      const result = await Promise.race([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
      ]);
      if (result.data) setProfile(result.data as UserProfile);
    } catch {
      // profile 获取失败不影响登录
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 获取当前 session（带超时，防止网络问题导致页面卡死）
    const sessionTimeout = setTimeout(() => {
      console.warn('[Auth] getSession 超时，跳过认证');
      setLoading(false);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      clearTimeout(sessionTimeout);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setLoading(false);
    }).catch(() => {
      clearTimeout(sessionTimeout);
      // session 获取失败，直接放行
      setLoading(false);
    });

    // 监听 auth state 变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        try {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.user) {
            await fetchProfile(newSession.user.id);
          } else {
            setProfile(null);
          }
        } catch {
          // 忽略 auth state change 错误
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (username: string, password: string) => {
    if (!supabase) return { error: '系统未配置' };
    // 通过 API 路由登录（服务端验证，不依赖客户端 Supabase 连接）
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.error) return { error: data.error };
    // 立即更新客户端状态（不等 Supabase 网络请求）
    if (data.data?.session) {
      setSession(data.data.session);
      setUser(data.data.session.user);
      // setSession 和 fetchProfile 后台执行，不阻塞登录流程
      supabase.auth.setSession(data.data.session).catch(() => {});
      fetchProfile(data.data.session.user.id).catch(() => {});
    }
    return { error: null };
  }, [fetchProfile]);

  const signUp = useCallback(async (username: string, password: string) => {
    if (!supabase) return { error: '系统未配置' };
    // 走 API 路由注册（使用 admin API，不发邮件）
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.error) return { error: data.error };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    // 先清理客户端状态
    setUser(null);
    setProfile(null);
    setSession(null);

    // 清除所有 Supabase 相关的 localStorage（多种 key 格式兜底）
    try {
      const keysToRemove = Object.keys(localStorage).filter(
        k => k.startsWith('sb-') || k.includes('supabase') || k.includes('-auth-token')
      );
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}

    // 尝试服务端登出（忽略网络错误）
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch {}

    // 强制刷新页面，确保完全重置
    window.location.href = '/auth/login';
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'github' | 'google') => {
    if (!supabase) return { error: '系统未配置' };
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        supabaseAvailable,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
