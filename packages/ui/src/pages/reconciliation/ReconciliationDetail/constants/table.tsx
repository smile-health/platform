import { ColumnDef } from '@tanstack/react-table'
import { TFunction } from 'i18next'

import { ReconciliationItem } from '../reconciliation-detail.service'

export const columsDetailReconciliation = (
  t: TFunction<['reconciliation', 'reconciliationDetail', 'common']>
): ColumnDef<ReconciliationItem>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => index + 1,
  },
  {
    header: t('reconciliationDetail:list.column.description'),
    accessorKey: 'description',
    id: 'description',
    size: 500,
    cell: ({ row: { original } }) => original.stock_category_label ?? '-',
  },
  {
    header: t('reconciliationDetail:list.column.smile_qty'),
    accessorKey: 'smile-qty',
    id: 'smile-qty',
    size: 500,
    cell: ({ row: { original } }) => original.smile_qty ?? '-',
  },
  {
    header: t('reconciliationDetail:list.column.real_qty'),
    accessorKey: 'real-qty',
    id: 'real-qty',
    size: 500,
    cell: ({ row: { original } }) => original.real_qty ?? '-',
  },
  {
    header: t('reconciliationDetail:list.column.reason'),
    accessorKey: 'real-qty',
    id: 'real-qty',
    size: 500,
    cell: ({ row: { original } }) =>
      original.reasons?.map((item: any) => {
        const reason = `${item.id}. ${item.title}`
        return <p key={item?.id}>{reason ?? '-'}</p>
      }),
  },
  {
    header: t('reconciliationDetail:list.column.action'),
    accessorKey: 'real-qty',
    id: 'real-qty',
    size: 500,
    cell: ({ row: { original } }) =>
      original.actions?.map((item: any) => {
        const action = `${item.id}. ${item.title}`
        return <p key={item?.id}>{action ?? '-'}</p>
      }),
  },
]
