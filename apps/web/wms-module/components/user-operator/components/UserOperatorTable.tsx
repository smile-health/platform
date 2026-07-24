import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deleteOperatorThirdparty } from '@/services/partnership-operator';
import { TOperatorThirdparty } from '@/types/partnership-operator';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsUserOperator } from '../constants/table';
import { useUserOperatorTable } from '../hooks/useUserOperatorTable';

type UserOperatorTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function UserOperatorTable({
  isLoading,
  size = 10,
  page = 1,
}: UserOperatorTableProps) {
  const { t } = useTranslation(['common', 'userOperator']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TOperatorThirdparty | null>(
    null
  );

  const { sorting, setSorting, userOperatorDataSource, refecthUserOperator } =
    useUserOperatorTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (value: TOperatorThirdparty) =>
      deleteOperatorThirdparty({
        operator_id: value.operatorId,
        partnership_id: Number(value.partnershipId),
      }),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('userOperator:list.list')?.toLowerCase(),
        }),
      });

      refecthUserOperator();
      setShowDeleteModal(false);
      setSelectedItem(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteUserOperator = useCallback((data: TOperatorThirdparty) => {
    setSelectedItem(data);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={userOperatorDataSource?.data.data}
        columns={columnsUserOperator(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteUserOperator,
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
        onSubmit={() => selectedItem && mutateRemove(selectedItem)}
      />
    </div>
  );
}
