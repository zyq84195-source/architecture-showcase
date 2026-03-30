import { useParams } from 'next/navigation';
import CaseForm from '@/components/admin/CaseForm';

export default function EditCasePage() {
  const params = useParams();
  const id = params.id as string;

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
