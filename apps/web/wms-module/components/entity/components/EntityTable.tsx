import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';
import { toast } from '@repo/ui/components/toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { columnsEntity } from '../constants/table';
import { useEntityTable } from '../hooks/useEntityTable';
import { ModalConfirmation } from '@/components/ModalConfirmation';
import { useState, useCallback } from 'react';
import { updateEntityStatus } from '@/services/entity';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { TEntitiesWms } from '@/types/entity';

type EntityTableProps = CommonType & {
  size?: number;
  page?: number;
  isLoading?: boolean;
};

type UpdateStatusPayload = {
  id: number;
  is_active: number;
};

export default function EntityTable({
  isLoading,
  size = 10,
  page = 1,
}: EntityTableProps) {
  const { t } = useTranslation(['common', 'entityWMS']);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedData, setSelectedData] = useState<TEntitiesWms | null>(null);
  const queryClient = useQueryClient();

  const { sorting, setSorting, entityDataSource } = useEntityTable();

  const { mutate: mutateUpdateStatus } = useMutation({
    mutationFn: ({ id, is_active }: UpdateStatusPayload) =>
      updateEntityStatus(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['entityWMS-list'],
      });
      toast.success({
        description: t('common:message.success.update', {
          type: t('entityWMS:list.status')?.toLowerCase(),
        }),
      });
      setShowUpdateStatusModal(false);
      setSelectedData(null);
    },
    onError: handleAxiosError,
  });

  const handleUpdateEntityStatus = useCallback((data: TEntitiesWms) => {
    setSelectedData(data);
    setShowUpdateStatusModal(true);
  }, []);

  const handleActivate = useCallback(() => {
    if (selectedData !== null) {
      mutateUpdateStatus({
        id: selectedData.id,
        is_active: selectedData.is_active ? 0 : 1,
      });
    }
  }, [selectedData, mutateUpdateStatus]);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={entityDataSource?.data?.data}
        columns={columnsEntity(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleUpdateEntityStatus,
        })}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
        className="ui-overflow-x-auto"
      />
      <ModalConfirmation
        open={showUpdateStatusModal}
        setOpen={setShowUpdateStatusModal}
        type="update"
        title={t('confirmation')}
        description={
          selectedData?.is_active
            ? t('entityWMS:action.deactivate.confirmation')
            : t('entityWMS:action.activate.confirmation')
        }
        onSubmit={handleActivate}
      />
    </div>
  );
}
