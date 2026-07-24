import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteHealthcare } from '@/services/healthcare';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsHealthcare } from '../constants/table';
import { useHealthcareTable } from '../hooks/useHealthcareTable';

type HealthcareTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function HealthcareTable({
  isLoading,
  size = 10,
  page = 1,
}: HealthcareTableProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tHealthCare } = useTranslation('healthCare');

  const { healthcareDataSource, refetchHealthcare } = useHealthcareTable();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deleteHealthcare(id),
    onSuccess: () => {
      toast.success({
        description: tCommon('message.success.delete', {
          type: tHealthCare('list.list')?.toLowerCase(),
        }),
      });

      refetchHealthcare();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteHealthcare = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={healthcareDataSource?.data?.data}
        columns={columnsHealthcare(tCommon, tHealthCare, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteHealthcare,
        })}
        isLoading={isLoading}
      />
      <ModalConfirmation
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        type="delete"
        title={tCommon('delete')}
        description={tCommon('delete_confirmation')}
        onSubmit={() => selectedId && mutateRemove(selectedId)}
      />
    </div>
  );
}
