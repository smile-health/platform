import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deletePartnership } from '@/services/partnership';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsPartnership } from '../constants/table';
import { usePartnershipTable } from '../hooks/usePartnershipTable';

type PartnershipTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function PartnershipTable({
  isLoading,
  size = 10,
  page = 1,
}: PartnershipTableProps) {
  const { t: tCommon } = useTranslation('common');
  const { t: tPartnership } = useTranslation('partnership');

  const { partnershipDataSource, refetchPartnership } = usePartnershipTable();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deletePartnership(id),
    onSuccess: () => {
      toast.success({
        description: tCommon('message.success.delete', {
          type: tPartnership('list.list')?.toLowerCase(),
        }),
      });

      refetchPartnership();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeletePartnership = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={partnershipDataSource?.data?.data}
        columns={columnsPartnership(tCommon, tPartnership, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeletePartnership,
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
