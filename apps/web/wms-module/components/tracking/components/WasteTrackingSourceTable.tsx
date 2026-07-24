import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteTrackingWasteSource } from '@/types/tracking';
import { ColumnsWasteSource } from '../constants/columnsWasteSource';

type TableProps = CommonType & {
  isLoading?: boolean;
  trackingWasteSourceDataSource?: TWasteTrackingWasteSource[];
};

export default function WasteTrackingSourceTable({
  isLoading,
  trackingWasteSourceDataSource,
}: TableProps) {
  const { t } = useTranslation(['common', 'tracking']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={trackingWasteSourceDataSource}
        columns={ColumnsWasteSource(t)}
        isLoading={isLoading}
        bodyClassName={
          trackingWasteSourceDataSource?.length ? 'ui-h-auto' : 'ui-h-48'
        }
      />
    </div>
  );
}
