import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteTrackingDetail } from '@/types/transaction';
import { ColumnsHomeHFDetail } from '../../constants/tableHF';

type TableProps = CommonType & {
  isLoading?: boolean;
  detailTransaction: TWasteTrackingDetail[];
};

export default function HomeHFDetailTable({
  isLoading,
  detailTransaction,
}: TableProps) {
  const { t } = useTranslation(['common', 'home']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={detailTransaction}
        columns={ColumnsHomeHFDetail(t)}
        isLoading={isLoading}
      />
    </div>
  );
}
