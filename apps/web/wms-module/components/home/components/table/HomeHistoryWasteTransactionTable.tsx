import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { THistoryTransactionWaste } from '@/types/homepage';
import { columnsHistoryTransaction } from '../../constants/tableHistoryTransaction';

type TableProps = CommonType & {
  isLoading?: boolean;
  historyTransactionWaste?: THistoryTransactionWaste[];
};

export default function HomeHistoryWasteTransactionTable({
  isLoading,
  historyTransactionWaste,
}: TableProps) {
  const { t } = useTranslation(['common', 'home']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={historyTransactionWaste}
        columns={columnsHistoryTransaction(t)}
        isLoading={isLoading}
      />
    </div>
  );
}
