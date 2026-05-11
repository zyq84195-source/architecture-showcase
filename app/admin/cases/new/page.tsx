'use client'

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CaseForm from '@/components/admin/CaseForm';

const ADMIN_SESSION_KEY = 'arch_admin_auth';

function NewCaseForm() {
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
        return Promise.resolve();
      }}
      onCancel={() => window.history.back()}
    />
  );
}

export default function NewCasePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewCaseForm />
    </Suspense>
  );
}
