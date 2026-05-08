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
      initialData={{
        id,
      }}
      onSubmit={async (data: any) => {
        // 这里会由父组件处理
        return Promise.resolve();
      }}
      onCancel={() => window.history.back()}
    />
  );
}
