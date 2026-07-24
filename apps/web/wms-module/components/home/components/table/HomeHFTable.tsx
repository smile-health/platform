import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteTransaction } from '@/types/transaction';
import { useState } from 'react';
import { ColumnsHomeHF } from '../../constants/tableHF';
import { HomeHFDetailModal } from '../detail/HomeHFDetailModal';

type TableProps = CommonType & {
  transactionDataSource?: TWasteTransaction[];
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function HomeHFTable({
  transactionDataSource,
  isLoading,
  size = 10,
  page = 1,
}: TableProps) {
  const { t } = useTranslation(['common', 'home']);
  const [isHomeHFDetailModalOpen, setIsHomeHFDetailModalOpen] = useState(false);
  const [selectedTransactionData, setSelectedTransactionData] =
    useState<TWasteTransaction | null>(null);

  const handleOpenHomeHFDetail = (data: TWasteTransaction) => {
    setSelectedTransactionData(data);
    setIsHomeHFDetailModalOpen(true);
  };
  return (
    <div className="ui-space-y-6">
      <DataTable
        data={transactionDataSource}
        columns={ColumnsHomeHF(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleHomeHFDetail: (data) => handleOpenHomeHFDetail(data),
        })}
        isLoading={isLoading}
      />

      {isHomeHFDetailModalOpen && selectedTransactionData && (
        <HomeHFDetailModal
          open={true}
          onClose={() => setIsHomeHFDetailModalOpen(false)}
          transactionData={selectedTransactionData}
        />
      )}
    </div>
  );
}
