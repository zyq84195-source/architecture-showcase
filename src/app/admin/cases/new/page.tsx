import { useSearchParams } from 'next/navigation';
import CaseForm from '@/components/admin/CaseForm';

export default function NewCasePage() {
  const searchParams = useSearchParams();
  const initialData = Object.fromEntries(searchParams);

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
