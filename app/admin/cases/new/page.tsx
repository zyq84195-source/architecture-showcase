'use client'

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaseForm from '@/components/admin/CaseForm';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialData = Object.fromEntries(searchParams);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (session !== 'authenticated') {
      router.push('/admin/cases');
    } else {
      setIsAdmin(true);
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <CaseForm
      initialData={initialData}
      onSubmit={async (data: any) => {
        // 这里会由父组件处理
        return Promise.resolve();
      }}
      onCancel={() => window.history.back()}
    />
  );
}
