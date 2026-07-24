import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { columnsWasteSpecification } from '../constants/table';
import { useWasteSpecificationTable } from '../hooks/useWasteSpecificationTable';

type WasteSpecificationTableProps = CommonType & {
  isLoading?: boolean;
  size?: number;
  page?: number;
};

export default function WasteSpecificationTable({
  isLoading,
  size = 10,
  page = 1,
}: WasteSpecificationTableProps) {
  const { t } = useTranslation(['common', 'wasteSpecification']);

  const { sorting, setSorting, wasteSpecificationDataSource } =
    useWasteSpecificationTable();

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={wasteSpecificationDataSource?.data.data}
        columns={columnsWasteSpecification(t, {
          page: page ?? 1,
          size: size ?? 10,
        })}
        isLoading={isLoading}
        setSorting={setSorting}
        sorting={sorting}
      />
    </div>
  );
}
