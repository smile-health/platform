import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';
import { toast } from '@repo/ui/components/toast';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useUserTable } from '../hooks/useUserTable';
import { ModalConfirmation } from '@/components/ModalConfirmation';
import { useState, useCallback } from 'react';
import { updateUserStatus } from '@/services/user';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { columnsUser } from '../constants/table';
import { TUser } from '@/types/user';

type UserTableProps = CommonType & {
  size?: number;
  page?: number;
  isLoading?: boolean;
};

type UpdateStatusPayload = {
  id: number;
  is_active: number;
};

export default function UserTable({
  isLoading,
  size = 10,
  page = 1,
}: UserTableProps) {
  const { t } = useTranslation(['common', 'userSetting']);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [selectedData, setSelectedData] = useState<TUser | null>(null);
  const queryClient = useQueryClient();

  const { sorting, setSorting, userDataSource } = useUserTable();

  const { mutate: mutateUpdateStatus } = useMutation({
    mutationFn: ({ id, is_active }: UpdateStatusPayload) =>
      updateUserStatus(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['userSetting-list'],
      });
      toast.success({
        description: t('common:message.success.update', {
          type: t('userSetting:title.status')?.toLowerCase(),
        }),
      });
      setShowUpdateStatusModal(false);
      setSelectedData(null);
    },
    onError: handleAxiosError,
  });

  const handleUpdateUserStatus = useCallback((data: TUser) => {
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
        data={userDataSource?.data?.data}
        columns={columnsUser(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleUpdateUserStatus,
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
            ? t('userSetting:confirmation.deactivate.question')
            : t('userSetting:confirmation.activate.question')
        }
        onSubmit={handleActivate}
      />
    </div>
  );
}
