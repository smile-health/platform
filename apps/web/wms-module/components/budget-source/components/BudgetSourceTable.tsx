import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TBudgetSource } from '@/types/budget-source';
import { columnsBudgetSource } from '../constants/table';

type BudgetSourceTableProps = CommonType & {
  budgetSourceData?: TBudgetSource[];
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function BudgetSourceTable({
  budgetSourceData,
  isLoading,
  size = 10,
  page = 1,
}: BudgetSourceTableProps) {
  const { t } = useTranslation(['common', 'budgetSource']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={budgetSourceData}
        columns={columnsBudgetSource(t, {
          page: page ?? 1,
          size: size ?? 10,
        })}
        isLoading={isLoading}
      />
    </div>
  );
}
