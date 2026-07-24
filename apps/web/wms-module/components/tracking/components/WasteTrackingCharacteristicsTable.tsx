import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { ColumnsWasteCharacteristics } from '../constants/columnsWasteCharacteristics';
import { useWasteTrackingTable } from '../hooks/useWasteTrackingTable';
import { transformWasteData } from '../utils/helper';

type TableProps = CommonType & {
  isLoading?: boolean;
};

export default function WasteTrackingCharacteristicsTable({
  isLoading,
}: TableProps) {
  const { t } = useTranslation(['common', 'tracking']);
  const { trackingCharacteristicsDataSource } = useWasteTrackingTable();

  const transformedData = transformWasteData(
    trackingCharacteristicsDataSource?.data?.data
  );

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={transformedData}
        columns={ColumnsWasteCharacteristics(t)}
        isLoading={isLoading}
        emptyDescription={t('tracking:list.emptyDescription')}
        bodyClassName={transformedData.length ? 'ui-h-auto' : 'ui-h-48'}
      />
    </div>
  );
}
