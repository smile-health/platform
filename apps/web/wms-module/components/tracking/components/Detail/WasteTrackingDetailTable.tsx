import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteTrackingDetail } from '@/types/transaction';
import { columnsTrackingDetail } from '../../constants/columnsTrackingDetail';

type TableProps = CommonType & {
  isLoading?: boolean;
  detailTransacion?: TWasteTrackingDetail[];
};

export default function WasteTrackingDetailTable({
  isLoading,
  detailTransacion,
}: TableProps) {
  const { t } = useTranslation(['common', 'tracking']);

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={detailTransacion}
        columns={columnsTrackingDetail(t)}
        isLoading={isLoading}
      />
    </div>
  );
}
