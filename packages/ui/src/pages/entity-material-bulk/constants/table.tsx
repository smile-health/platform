import { ColumnDef } from '@tanstack/react-table'
import ActiveLabel from '#components/modules/ActiveLabel'
import { EntityMaterialBulk } from '#types/entity-material-bulk'
import { parseDateTime } from '#utils/date'
import { TFunction } from 'i18next'

import EntityMaterialBulkColumnNotes from '../components/EntityMaterialBulkColumnNotes'

export const columns = (
  t: TFunction<['common', 'entityMaterialBulk']>,
  handleSeeMore: (notes: { [key: string]: string[] }) => void
): ColumnDef<EntityMaterialBulk>[] => [
  {
    header: t('entityMaterialBulk:list.column.import'),
    accessorKey: 'user_created_by',
    cell: ({ row: { original } }) =>
      `${original?.user_created_by?.firstname ? original?.user_created_by?.firstname : ''} ${original?.user_created_by?.lastname ? original?.user_created_by?.lastname : ''}`,
    minSize: 160,
  },
  {
    header: t('entityMaterialBulk:list.column.file'),
    accessorKey: 'file',
  },
  {
    header: t('entityMaterialBulk:list.column.date'),
    accessorKey: 'created_at',
    cell: ({ row }) =>
      parseDateTime(row.original.created_at, 'DD MMMM YYYY HH:mm:ss'),
    size: 250,
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ row }) => <ActiveLabel isActive={row.original.status} type="2" />,
    size: 100,
  },
  {
    header: t('entityMaterialBulk:list.column.notes'),
    accessorKey: 'notes',
    cell: ({ row: { original } }) =>
      !original.notes ? (
        '-'
      ) : (
        <EntityMaterialBulkColumnNotes
          notes={original.notes}
          handleSeeMore={handleSeeMore}
        />
      ),
  },
]
