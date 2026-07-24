import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TLogbook } from '@/types/logbook';
import { useState } from 'react';
import { ColumnsLogbook } from '../constants/table';
import { useLogbookTable } from '../hooks/useLogbookTable';
import { DisposalDetailModal } from './Detail/DisposalDetailModal';

type TableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function LogbookTable({
  isLoading,
  size = 10,
  page = 1,
}: TableProps) {
  const { t } = useTranslation(['common', 'logbook']);
  const [isDisposalDetailModalOpen, setIsDisposalDetailModalOpen] =
    useState(false);
  const [selectedTransactionData, setSelectedTransactionData] =
    useState<TLogbook | null>(null);
  const { logbookDataSource } = useLogbookTable();

  const handleOpenDisposalDetail = (data: TLogbook) => {
    setSelectedTransactionData(data);
    setIsDisposalDetailModalOpen(true);
  };
  return (
    <div className="ui-space-y-6">
      <DataTable
        data={logbookDataSource?.data?.data}
        columns={ColumnsLogbook(t, {
          page: page ?? 1,
          size: size ?? 10,
          handleDisposalDetail: (data) => handleOpenDisposalDetail(data),
        })}
        isLoading={isLoading}
      />
      {isDisposalDetailModalOpen && selectedTransactionData && (
        <DisposalDetailModal
          open={true}
          onClose={() => setIsDisposalDetailModalOpen(false)}
          disposalData={selectedTransactionData}
        />
      )}
    </div>
  );
}
