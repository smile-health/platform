import { THistoryTransactionWaste } from '@/types/homepage';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

export const columnsHistoryTransaction = (
  t: TFunction<['common', 'home']>
): ColumnDef<THistoryTransactionWaste>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('home:home_superadmin.modal.waste_status'),
    accessorKey: 'waste_status',
    id: 'waste_status',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.wasteBagStatus ?? '-',
  },
  {
    header: t('home:home_superadmin.modal.updated_status'),
    accessorKey: 'updated_status',
    id: 'updated_status',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.updatedAtStatus
        ? dayjs(original.updatedAtStatus).format('DD/MM/YYYY HH:mm')
        : '-',
  },
];
