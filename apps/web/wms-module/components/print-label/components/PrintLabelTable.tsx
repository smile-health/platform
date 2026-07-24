import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deletePrintLabel } from '@/services/print-label';
import { CommonType } from '@/types/common';
import { TPrintLabel } from '@/types/print-label';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { DataTable } from '@repo/ui/components/data-table';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { columnsPrintLabel } from '../constants/table';
import { usePrintLabelTable } from '../hooks/usePrintLabelTable';

type PrintLabelTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
  rowSelection: Record<string, boolean>;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  onSelectionChange: (rows: TPrintLabel[]) => void;
};

export default function PrintLabelTable({
  isLoading,
  size = 10,
  page = 1,
  rowSelection,
  setRowSelection,
  onSelectionChange,
}: PrintLabelTableProps) {
  const { t } = useTranslation(['common', 'printLabel']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { sorting, setSorting, printLabelDataSource, refetchPrintLabel } =
    usePrintLabelTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deletePrintLabel(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('printLabel:list.list')?.toLowerCase(),
        }),
      });

      refetchPrintLabel();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeletePrintLabel = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={printLabelDataSource?.data?.data}
        columns={columnsPrintLabel(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeletePrintLabel,
          setRowSelection,
        })}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        onSelectionChange={(selected) => onSelectionChange(selected)}
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
