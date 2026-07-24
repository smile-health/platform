import { DisposalItem } from '@/types/bast';
import { ColumnDef } from '@tanstack/react-table';
import { TFunction } from 'i18next';

type DataProps = {
  page: number;
  size: number;
};

export const columnsDisposalItem = (
  t: TFunction<['common', 'bast']>,
  { page, size }: DataProps
): ColumnDef<DisposalItem>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 100,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('bast:list.column.material_id'),
    accessorKey: 'material_id',
    id: 'material_id',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.materialId ?? '-',
  },
  {
    header: t('bast:list.column.material_name'),
    accessorKey: 'material_name',
    id: 'material_name',
    size: 800,
    enableSorting: false,
    cell: ({ row: { original } }) => original.materialName ?? '-',
  },
  {
    header: t('bast:list.column.qty'),
    accessorKey: 'qty',
    id: 'qty',
    size: 200,
    enableSorting: false,
    cell: ({ row: { original } }) => original.qty ?? '-',
  },
];
