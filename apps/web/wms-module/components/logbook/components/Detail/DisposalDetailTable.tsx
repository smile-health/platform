import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

import { TWasteGroup } from '@/types/waste-group';
import { ColumnsWasteGroupDetail } from '../../constants/columnsDisposalDetail';
import DisposalSubDetailTable from './DisposalSubDetailTable';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';
import { Row } from '@tanstack/react-table';

type TableProps = CommonType & {
  isLoading?: boolean;
  detailWasteGroup?: TWasteGroup[];
};

export default function DisposalDetailTable({
  isLoading,
  detailWasteGroup,
}: TableProps) {
  const { t } = useTranslation(['common', 'logbook']);
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();

  const renderSubComponent = ({ row }: { row: Row<TWasteGroup> }) => {
    const wasteQrCode = row.original.wasteQrCode;
    return <DisposalSubDetailTable expandedId={wasteQrCode} />;
  };

  return (
    <div className="ui-space-y-6">
      <DataTable
        data={detailWasteGroup}
        columns={ColumnsWasteGroupDetail(t, formatWasteBagWeight, unit)}
        isLoading={isLoading}
        renderSubComponent={renderSubComponent}
        handleExpand={() => true}
        onClickRow={(row) => {
          row.toggleExpanded();
        }}
      />
    </div>
  );
}
