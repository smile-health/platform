import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ColumnsTransaction } from '../constants/table';
import { useTransactionTable } from '../hooks/useTransactionTable';

type TableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function TransactionTable({
  isLoading,
  size = 10,
  page = 1,
}: TableProps) {
  const { t } = useTranslation(['common', 'transaction']);

  const { transactionDataSource } = useTransactionTable();

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={transactionDataSource?.data?.data}
        columns={ColumnsTransaction(t, {
          page: page ?? 1,
          size: size ?? 10,
        })}
        isLoading={isLoading}
      />
    </div>
  );
}
