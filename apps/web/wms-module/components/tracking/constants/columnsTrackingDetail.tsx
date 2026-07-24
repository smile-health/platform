import { TWasteTrackingDetail } from '@/types/transaction';
import { mapWasteStatus } from '@/utils/mappingWasteStatus';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

export const columnsTrackingDetail = (
  t: TFunction<['common', 'tracking']>
): ColumnDef<TWasteTrackingDetail>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('tracking:modal.column.updated_status'),
    accessorKey: 'updated_status',
    id: 'updated_status',
    size: 180,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.wasteBagStatusUpdateDate
        ? dayjs(original.wasteBagStatusUpdateDate).format('DD/MM/YYYY HH:mm')
        : '-',
  },
  {
    header: t('tracking:modal.column.waste_status'),
    accessorKey: 'waste_status',
    id: 'waste_status',
    size: 150,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      mapWasteStatus(original.wasteStatus, original.disposalMethod),
  },
];
