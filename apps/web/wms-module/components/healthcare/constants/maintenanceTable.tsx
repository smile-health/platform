import { THFAssetActivity } from '@/types/hf-asset-activity';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import dayjs from 'dayjs';

type DataProps = {
  page: number;
  size: number;
};

export const columnsMaintenance = (
  t: TFunction<['common', 'healthCare']>,
  { page, size }: DataProps
): ColumnDef<THFAssetActivity>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 200,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('healthCare:list.column_maintenance.maintenance_date'),
    accessorKey: 'maintenance_date',
    id: 'maintenance_date',
    size: 1000,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.startDate ? dayjs(original.startDate).format('DD/MM/YYYY') : '-',
  },
  {
    header: t('healthCare:list.column_maintenance.operator_name'),
    accessorKey: 'operator_name',
    size: 1000,
    id: 'operator_name',
    enableSorting: false,
    cell: ({ row: { original } }) => original.operatorId ?? '-',
  },
];
