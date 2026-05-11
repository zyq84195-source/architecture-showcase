'use client'

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CaseForm from '@/components/admin/CaseForm';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isAdmin, setIsAdmin] = useState(false);
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session !== 'authenticated' && !session) {
      router.push('/admin/cases');
      return;
    }
    setIsAdmin(true);

    // Fetch case data
    const fetchCase = async () => {
      try {
        const response = await fetch(`/api/admin/cases/${id}`);
        const result = await response.json();
        if (result.success) {
          setCaseData(result.data);
        } else {
          alert('案例不存在');
          router.push('/admin/cases');
        }
      } catch {
        alert('加载失败');
        router.push('/admin/cases');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id, router]);

  if (!isAdmin) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">加载中...</p>
      </div>
    );
  }

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
        initialData={caseData}
        onSubmit={async (data: any) => {
          const response = await fetch(`/api/admin/cases/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            alert('保存成功');
            router.push('/admin/cases');
          } else {
            const result = await response.json();
            alert(result.error || '保存失败');
          }
        }}
        onCancel={() => router.push('/admin/cases')}
      />
    </div>
  );
}
