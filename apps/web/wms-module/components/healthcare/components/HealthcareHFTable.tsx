import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteHealthcare } from '@/services/healthcare';
import { CommonType } from '@/types/common';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { DataTable } from '@repo/ui/components/data-table';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { columnsHealthcareHF } from '../constants/tableHF';
import { useHealthcareHFTable } from '../hooks/useHealthcareHFTable';

type HealthcareTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function HealthcareHFTable({
  isLoading,
  size = 10,
  page = 1,
}: HealthcareTableProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tHealthCare } = useTranslation('healthCare');
  const { healthcareDataSource, refetchHealthcare } = useHealthcareHFTable();
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
        columns={columnsHealthcareHF(tCommon, tHealthCare, {
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
