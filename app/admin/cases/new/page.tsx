'use client'

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CaseForm from '@/components/admin/CaseForm';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

function NewCaseForm() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session !== 'authenticated' && !session) {
      router.push('/admin/cases');
    } else {
      setIsAdmin(true);
    }
  }, [router]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/admin/cases')}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ← 返回案例列表
          </button>
        </div>
      </div>
      <CaseForm
        onSubmit={async (data: any) => {
          const response = await fetch('/api/admin/cases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            alert('创建成功');
            router.push('/admin/cases');
          } else {
            const result = await response.json();
            alert(result.error || '创建失败');
          }
        }}
        onCancel={() => router.push('/admin/cases')}
      />
    </div>
  );
}

export default function NewCasePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">加载中...</p></div>}>
      <NewCaseForm />
    </Suspense>
  );
}
