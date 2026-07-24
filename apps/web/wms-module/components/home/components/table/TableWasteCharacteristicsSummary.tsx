import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteCharacteristicSummary } from '@/types/homepage';
import { ColumnsWasteCharacteristicsSummary } from '../../constants/tableWasteCharacteristicsSummary';

type TableProps = CommonType & {
  isLoading?: boolean;
  wasteCharacteristicsSummary?: TWasteCharacteristicSummary[];
};

export default function TableWasteCharacteristicsSummary({
  isLoading,
  wasteCharacteristicsSummary,
}: TableProps) {
  const { t } = useTranslation(['common', 'home']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={wasteCharacteristicsSummary}
        columns={ColumnsWasteCharacteristicsSummary(t)}
        isLoading={isLoading}
      />
    </div>
  );
}
