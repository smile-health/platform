import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteEntityLocation } from '@/services/entity-location';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsTreatmentLocation } from '../constants/table';
import { useTreatmentLocationTable } from '../hooks/useTreatmentLocationTable';

type TreatmentLocationTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function TreatmentLocationTable({
  isLoading,
  size = 10,
  page = 1,
}: TreatmentLocationTableProps) {
  const { t } = useTranslation(['common', 'treatmentLocation']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    sorting,
    setSorting,
    treatmentLocationDataSource,
    refetchTreatmentLocation,
  } = useTreatmentLocationTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deleteEntityLocation(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('treatmentLocation:list.list')?.toLowerCase(),
        }),
      });

      refetchTreatmentLocation();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteEntityLocation = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={treatmentLocationDataSource?.data.data}
        columns={columnsTreatmentLocation(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteEntityLocation,
        })}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
      />
      <ModalConfirmation
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        type="delete"
        title={t('common:delete')}
        description={t('common:delete_confirmation')}
        onSubmit={() => selectedId && mutateRemove(selectedId)}
      />
    </div>
  );
}
