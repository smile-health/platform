import { THFAssetActivity } from '@/types/hf-asset-activity';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';
import dayjs from 'dayjs';

type DataProps = {
  page: number;
  size: number;
};

export const columnsCalibration = (
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
    header: t('healthCare:list.column_calibration.calibration_start_date'),
    accessorKey: 'calibration_start_date',
    id: 'calibration_start_date',
    size: 1000,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.startDate ? dayjs(original.startDate).format('DD/MM/YYYY') : '-',
  },
  {
    header: t('healthCare:list.column_calibration.calibration_end_date'),
    accessorKey: 'calibration_end_date',
    id: 'calibration_end_date',
    size: 1000,
    enableSorting: false,
    cell: ({ row: { original } }) =>
      original.endDate ? dayjs(original.endDate).format('DD/MM/YYYY') : '-',
  },
  {
    header: t('healthCare:list.column_calibration.operator_name'),
    accessorKey: 'operator_name',
    size: 1000,
    id: 'operator_name',
    enableSorting: false,
    cell: ({ row: { original } }) => original.operatorId ?? '-',
  },
];
