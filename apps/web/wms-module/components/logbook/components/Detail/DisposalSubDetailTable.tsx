import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@repo/ui/components/data-table';
import { getWasteGroupDetail } from '@/services/waste-group';
import { ErrorResponse } from '@/types/common';
import { GetWasteGroupDetailResponse } from '@/types/waste-group';
import {
  ColumnsWasteBagDetailItem,
  ColumnsWasteGroupDetailItem,
} from '../../constants/columnsDisposalDetail';
import { useFormatWasteBagWeight } from '@/utils/hooks/useFormatWeight';

type SubWasteBagTableProps = {
  expandedId: string;
};

export default function DisposalSubDetailTable({
  expandedId,
}: SubWasteBagTableProps) {
  const { t } = useTranslation(['common', 'logbook']);
  const { formatWasteBagWeight, unit } = useFormatWasteBagWeight();
  const { data, isLoading } = useQuery<
    GetWasteGroupDetailResponse,
    AxiosError<ErrorResponse>
  >({
    queryKey: ['waste-group-detail-item', expandedId],
    queryFn: () => getWasteGroupDetail(expandedId),
    enabled: !!expandedId,
  });

  const wasteBags = data?.data || [];

  const renderSubComponent = ({ row }: { row: any }) => {
    const bag = row.original.wasteBags;
    return (
      <div className="ui-p-4 ui-bg-gray-50 ui-border-t ui-border-gray-200">
        <DataTable
          data={bag}
          columns={ColumnsWasteBagDetailItem(t, formatWasteBagWeight, unit)}
          isLoading={isLoading}
        />
      </div>
    );
  };

  return (
    <div className="ui-p-4 ui-bg-gray-50 ui-border-t ui-border-gray-200">
      <DataTable
        data={wasteBags}
        columns={ColumnsWasteGroupDetailItem(t, formatWasteBagWeight, unit)}
        isLoading={isLoading}
        handleExpand={() => true}
        renderSubComponent={renderSubComponent}
        bodyClassName="ui-h-auto"
        onClickRow={(row) => {
          row.toggleExpanded();
        }}
      />
    </div>
  );
}
