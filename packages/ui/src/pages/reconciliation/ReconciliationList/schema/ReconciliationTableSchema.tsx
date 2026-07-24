import { ColumnDef } from '@tanstack/react-table'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import ReconciliationDetailModal from '../components/ReconciliationDetailModal'
import {
  capitalize,
  textGrouper,
  TitleBlock,
} from '../reconciliation-list.helpers'
import { Item, TReconciliationData } from '../reconciliation-list.type'

export const reconciliationTableSchema = ({
  t,
  locale,
  page,
  size,
}: {
  t: TFunction<'reconciliation'>
  locale: string
  page: number
  size: number
}) => {
  const schema: Array<ColumnDef<TReconciliationData>> = [
    {
      header: t('list.table.column.no'),
      accessorKey: 'no',
      size: 20,
      cell: ({ row: { index } }) =>
        numberFormatter((page - 1) * size + (index + 1), locale),
    },
    {
      header: t('list.table.column.entity_name'),
      accessorKey: 'entity',
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              label: row.original?.entity?.name ?? '',
            },
            {
              label: textGrouper({
                text1: capitalize(
                  row.original?.entity?.entity?.regency?.name ?? ''
                ),
                text2: capitalize(
                  row.original?.entity?.entity?.province?.name ?? ''
                ),
              }),
              className: 'ui-text-neutral-500 ui-text-sm',
            },
          ]}
        />
      ),
    },
    {
      header: t('list.table.column.material_info'),
      accessorKey: 'material',
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              label: row.original?.material_parent?.name ?? '',
              className: 'ui-font-bold',
            },
            {
              label: row.original?.material?.name ?? '',
              className: 'ui-text-neutral-500 ui-text-sm',
            },
          ]}
        />
      ),
    },
    {
      header: t('list.table.column.activity'),
      accessorKey: 'activity',
      cell: ({ row }) => row.original.activity?.name,
    },
    {
      header: t('list.table.column.period'),
      accessorKey: 'period',
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              label: `${t('list.table.from')}: ${parseDateTime(row.original.start_date, 'DD MMM YYYY', locale)}`,
            },
            {
              label: `${t('list.table.to')}: ${parseDateTime(row.original.end_date, 'DD MMM YYYY', locale)}`,
            },
          ]}
        />
      ),
    },
    {
      header: t('list.table.column.remaining_stock'),
      accessorKey: 'remaining_stock',
      meta: {
        cellClassName: () => 'ui-bg-primary-100',
      },
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              label: `SMILE: ${numberFormatter(row.original.items?.[6]?.recorded_qty, locale)}`,
            },
            {
              label: `${t('list.table.real')}: ${numberFormatter(row.original.items?.[6]?.actual_qty, locale)}`,
            },
          ]}
        />
      ),
    },
    {
      header: t('list.table.column.created_by'),
      accessorKey: 'created_by',
      cell: ({ row }) => (
        <TitleBlock
          arrText={[
            {
              label: `${row.original.user_created_by?.firstname ?? ''} ${row.original.user_created_by?.lastname ?? ''} ${t('list.table.at')}`,
            },
            {
              label: `${parseDateTime(row.original.created_at, 'DD MMM YYYY HH:mm', locale)}`,
            },
          ]}
        />
      ),
    },
    {
      header: t('list.table.column.action'),
      accessorKey: 'action',
      cell: ({ row }) => (
        <ReconciliationDetailModal
          id={row.original?.id}
          t={t}
          locale={locale}
        />
      ),
    },
  ]

  return schema
}

export const detailReconciliationTableSchema = ({
  t,
  locale,
}: {
  t: TFunction<'reconciliation'>
  locale: string
}) => {
  const schema: Array<ColumnDef<Item>> = [
    {
      header: t('list.table.column.no'),
      accessorKey: 'no',
      size: 20,
      cell: ({ row: { index } }) => numberFormatter(index + 1, locale),
    },
    {
      header: t('list.table.description'),
      accessorKey: 'description',
      cell: ({ row }) => row.original?.reconciliation_category_label,
    },
    {
      header: 'SMILE',
      accessorKey: 'recorded_qty',
      cell: ({ row }) => numberFormatter(row.original.recorded_qty, locale),
    },
    {
      header: t('list.table.real'),
      accessorKey: 'actual_qty',
      cell: ({ row }) => numberFormatter(row.original.actual_qty, locale),
    },
    {
      header: t('list.table.reason_action'),
      accessorKey: 'reason_action',
      cell: ({ row }) => {
        return (
          <div className="ui-flex ui-flex-col ui-space-y-3">
            {row.original?.reasons?.map((item, index) => (
              <div
                className="ui-flex ui-flex-col ui-space-y-1 ui-text-dark-blue"
                key={`${index.toString()}`}
              >
                <TitleBlock
                  arrText={[
                    {
                      label: `${t('list.table.reason')}: ${item.title}`,
                    },
                    {
                      label: `${t('list.table.action')}: ${row.original?.actions?.[index]?.title}`,
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )
      },
    },
  ]

  return schema
}

export default {}
