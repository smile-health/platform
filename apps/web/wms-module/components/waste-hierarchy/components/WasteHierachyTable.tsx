import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteWasteHierarchy } from '@/services/waste-hierarchy';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
  columnsWasteCharacteristic,
  columnsWasteGroup,
  columnsWasteType,
} from '../constants/table';
import { useWasteHierarchyTable } from '../hooks/useWasteHierarchyTable';

type WasteHierachyTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
  tab?: string;
};

export default function WasteHierachyTable({
  isLoading,
  size = 10,
  page = 1,
  tab = 'waste_type',
}: WasteHierachyTableProps) {
  const { t } = useTranslation(['common', 'wasteHierarchy']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const {
    sorting,
    setSorting,
    wasteHierarchyDataSource,
    refetchWasteHierarchy,
  } = useWasteHierarchyTable({
    level: tab === 'waste_type' ? 0 : tab === 'waste_group' ? 1 : 2,
    tab: tab,
  });

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deleteWasteHierarchy(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type:
            tab === 'waste_type'
              ? t('wasteHierarchy:title.waste_type')?.toLowerCase()
              : tab === 'waste_group'
                ? t('wasteHierarchy:title.waste_group')?.toLowerCase()
                : t('wasteHierarchy:title.waste_characteristic')?.toLowerCase(),
        }),
      });

      refetchWasteHierarchy();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteWasteHierarchy = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={wasteHierarchyDataSource?.data.data}
        columns={
          tab === 'waste_type'
            ? columnsWasteType(t, {
                page: page ?? 1,
                size: size ?? 10,
                tab: tab,
                handleDeleteWasteHierarchy,
              })
            : tab === 'waste_group'
              ? columnsWasteGroup(t, {
                  page: page ?? 1,
                  size: size ?? 10,
                  tab: tab,
                  handleDeleteWasteHierarchy,
                })
              : columnsWasteCharacteristic(t, {
                  page: page ?? 1,
                  size: size ?? 10,
                  tab: tab,
                })
        }
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
