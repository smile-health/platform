import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';

import { columnsAssetDongle } from '../constants/assetDongleTable';
import { useAssetDongleTable } from '../hooks/useAssetDongleTable';
import { deleteAssetDongle } from '@/services/asset-dongle';
import { toast } from '@repo/ui/components/toast';
import { useMutation } from '@tanstack/react-query';
import { ModalConfirmation } from '@/components/ModalConfirmation';
import { handleAxiosError } from '@/utils/handleAxiosError';

type AssetDongleTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function AssetDongleTables({
  isLoading,
  size = 10,
  page = 1,
}: AssetDongleTableProps) {
  const { t } = useTranslation(['common', 'assetDongle']);

  const { assetDongleDataSource, refetchAssetDongle } = useAssetDongleTable();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const { mutate: mutateRemove } = useMutation({
    mutationFn: (id: string) => deleteAssetDongle(id),
    onSuccess: () => {
      toast.success({
        description: t('common:message.success.delete', {
          type: t('assetDongle:title.dongle_id')?.toLowerCase(),
        }),
      });

      refetchAssetDongle();
      setShowDeleteModal(false);
      setSelectedAssetId(null);
    },
    onError: handleAxiosError,
  });
  const handleDeleteAssetDongle = useCallback((assetId: string) => {
    setSelectedAssetId(assetId);
    setShowDeleteModal(true);
  }, []);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={assetDongleDataSource?.data.data}
        columns={columnsAssetDongle(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDeleteAssetDongle,
        })}
        isLoading={isLoading}
      />
      <ModalConfirmation
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        type="delete"
        title={t('common:delete')}
        description={t('common:delete_confirmation')}
        onSubmit={() => selectedAssetId && mutateRemove(selectedAssetId)}
      />
    </div>
  );
}
