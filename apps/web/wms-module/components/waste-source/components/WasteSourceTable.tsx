import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteWasteSource } from '@/services/waste-source';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsWasteSource } from '../constants/table';
import { useWasteSourceTable } from '../hooks/useWasteSourceTable';

type WasteSourceTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function WasteSourceTable({
  isLoading,
  size = 10,
  page = 1,
}: WasteSourceTableProps) {
  const { t } = useTranslation(['common', 'wasteSource']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { sorting, setSorting, wasteSourceDataSource, refetchWasteSource } =
    useWasteSourceTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deleteWasteSource(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('wasteSource:title.waste_source')?.toLowerCase(),
        }),
      });

      refetchWasteSource();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteWasteSource = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={wasteSourceDataSource?.data.data}
        columns={columnsWasteSource(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteWasteSource,
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
