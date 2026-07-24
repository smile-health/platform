import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ModalConfirmation } from '@/components/ModalConfirmation';
import { deletePartnership } from '@/services/partnership';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { columnsThirdPartyPartner } from '../constants/table';
import { useThirdPartyPartnerTable } from '../hooks/useThirdPartyPartnerTable';

type ThirdPartyPartnerTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function ThirdPartyPartnerTable({
  isLoading,
  size = 10,
  page = 1,
}: ThirdPartyPartnerTableProps) {
  const { t } = useTranslation(['common', 'thirdPartyPartner']);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { partnershipDataSource, refetchThirdPartyPartner } =
    useThirdPartyPartnerTable();

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: number) => deletePartnership(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('thirdPartyPartner:list.list')?.toLowerCase(),
        }),
      });

      refetchThirdPartyPartner();
      setShowDeleteModal(false);
      setSelectedId(null);
    },
    onError: handleAxiosError,
  });

  const handleDeleteThirdPartyPartner = useCallback((id: number) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={partnershipDataSource?.data?.data}
        columns={columnsThirdPartyPartner(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteThirdPartyPartner,
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
