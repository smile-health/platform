import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteManufacture } from '@/services/manufacture';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsManufacture } from '../constants/table';
import { useManufactureTable } from '../hooks/useManufactureTable';

type ManufactureTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function ManufactureTable({
  isLoading,
  size = 10,
  page = 1,
}: ManufactureTableProps) {
  const { t } = useTranslation(['common', 'manufacture']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { sorting, setSorting, manufactureDataSource, refetchManufacture } =
    useManufactureTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deleteManufacture(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('manufacture:title.manufacture')?.toLowerCase(),
        }),
      });

      refetchManufacture();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteManufacture = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={manufactureDataSource?.data.data}
        columns={columnsManufacture(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteManufacture,
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
