import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deletePartnershipVehicle } from '@/services/partnership-vehicle';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsPartnershipVehicle } from '../constants/table';
import { usePartnershipVehicleTable } from '../hooks/usePartnershipVehicleTable';

type PartnershipVehicleTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function PartnershipVehicleTable({
  isLoading,
  size = 10,
  page = 1,
}: PartnershipVehicleTableProps) {
  const { t } = useTranslation(['common', 'partnershipVehicle']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { partnershipVehicleDataSource, refetchPartnershipVehicle } =
    usePartnershipVehicleTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deletePartnershipVehicle(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('partnershipVehicle:list.list')?.toLowerCase(),
        }),
      });

      refetchPartnershipVehicle();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeletePartnershipVehicle = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={partnershipVehicleDataSource?.data?.data}
        columns={columnsPartnershipVehicle(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeletePartnershipVehicle,
        })}
        isLoading={isLoading}
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
