import { ModalConfirmation } from '@/components/ModalConfirmation';
import { TBast } from '@/types/bast';
import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { columnsBast } from '../constants/table';
import useBastApprovalHandler from '../hooks/useBastApprovalHandler';
import BastDetailInfoModal from './Detail/BastDetailInfoModal';

type BastTableProps = CommonType & {
  bastDataSource?: TBast[];
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function BastTable({
  bastDataSource,
  isLoading,
  size = 10,
  page = 1,
}: BastTableProps) {
  const { t } = useTranslation(['common', 'bast']);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const [selectedBastData, setSelectedBastData] = useState<TBast | null>(null);

  const handleOpenDetail = (data: TBast) => {
    setSelectedBastData(data);
    setIsDetailModalOpen(true);
  };

  const handleApproval = (data: TBast) => {
    setSelectedBastData(data);
    handleRequestApprovalClick(data);
  };

  const {
    setShowRequestApprovalModal,
    showRequestApprovalModal,
    handleAcceptRequestApproval,
    handleRejectRequestApproval,
    handleRequestApprovalClick,
  } = useBastApprovalHandler();

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={bastDataSource}
        columns={columnsBast(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleOpenDetail,
          handleApproval,
        })}
        isLoading={isLoading}
      />
      {isDetailModalOpen && selectedBastData && (
        <BastDetailInfoModal
          open={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          data={selectedBastData}
          isLoading={false}
        />
      )}
      <ModalConfirmation
        open={showRequestApprovalModal}
        setOpen={setShowRequestApprovalModal}
        type="dual-action"
        title={t('bast:title.handover_document_approval')}
        description={t('bast:list.action.description', {
          bast: selectedBastData?.bastNo,
        })}
        confirmText={t('common:accept')}
        cancelText={t('common:reject')}
        onSubmit={handleAcceptRequestApproval}
        onReject={handleRejectRequestApproval}
      />
    </div>
  );
}
