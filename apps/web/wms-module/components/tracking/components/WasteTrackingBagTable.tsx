import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteTransaction } from '@/types/transaction';
import { useState } from 'react';
import { ColumnsWasteBag } from '../constants/columnsWasteBag';
import { useWasteTrackingTable } from '../hooks/useWasteTrackingTable';
import { TrackingDetailModal } from './Detail/TrackingDetailModal';

type TableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function WasteTrackingBagTable({
  isLoading,
  size = 10,
  page = 1,
}: TableProps) {
  const { t } = useTranslation(['common', 'tracking']);
  const [isTrackingDetailModalOpen, setIsTrackingDetailModalOpen] =
    useState(false);

  const [selectedTransactionData, setSelectedTransactionData] =
    useState<TWasteTransaction | null>(null);

  const { trackingBagDataSource } = useWasteTrackingTable();

  const handleOpenTrackingDetail = (data: TWasteTransaction) => {
    setSelectedTransactionData(data);
    setIsTrackingDetailModalOpen(true);
  };

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={trackingBagDataSource?.data?.data}
        columns={ColumnsWasteBag(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleTrackingDetail: (data) => handleOpenTrackingDetail(data),
        })}
        isLoading={isLoading}
        emptyDescription={t('tracking:list.emptyDescription')}
        bodyClassName={
          trackingBagDataSource?.data?.data.length ? 'ui-h-auto' : 'ui-h-48'
        }
      />
      {isTrackingDetailModalOpen && selectedTransactionData && (
        <TrackingDetailModal
          open={true}
          onClose={() => setIsTrackingDetailModalOpen(false)}
          transactionData={selectedTransactionData}
        />
      )}
    </div>
  );
}
