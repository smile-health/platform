import { ColumnDef } from '@tanstack/react-table'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { ItemLPLPO } from '../lplpo.type'

const LPLPOTableSchema = (t: TFunction<'lplpo'>, lang: string) => {
  const schema: Array<ColumnDef<ItemLPLPO>> = [
    {
      header: 'No.',
      accessorKey: 'number',
      size: 20,
      maxSize: 20,
    },
    {
      header: t('column.material'),
      accessorKey: 'name',
    },
    {
      header: t('column.unit'),
      accessorKey: 'unit',
    },
    {
      header: t('column.opening_stock'),
      accessorKey: 'opening_stock',
      cell: ({ row }) => numberFormatter(row.original.opening_qty, lang),
    },
    {
      header: t('column.receive'),
      accessorKey: 'received_qty',
      cell: ({ row }) => numberFormatter(row.original.received_qty, lang),
    },
    {
      header: t('column.usage'),
      accessorKey: 'issues_qty',
      cell: ({ row }) => numberFormatter(row.original.issues_qty, lang),
    },
    {
      header: t('column.closing_stock'),
      accessorKey: 'closing_qty',
      cell: ({ row }) => numberFormatter(row.original.closing_qty, lang),
    },
    {
      header: t('column.budget_source'),
      accessorKey: 'budget_source',
      cell: ({ row }) => {
        return (
          <div className="ui-flex ui-flex-col ui-space-y-1">
            <p>APBN: {row.original?.budget_source?.apbn ? t('yes') : '-'}</p>
            <p>Dak: {row.original?.budget_source?.dak ? t('yes') : '-'}</p>
            <p>
              APBD-I: {row.original?.budget_source?.apbd_1 ? t('yes') : '-'}
            </p>
            <p>
              APBD II: {row.original?.budget_source?.apbd_2 ? t('yes') : '-'}
            </p>
            <p>
              Lainnya: {row.original?.budget_source?.other ? t('yes') : '-'}
            </p>
          </div>
        )
      },
    },
    {
      header: t('column.description'),
      accessorKey: 'information',
      cell: ({ row }) => row.original.information ?? '-',
    },
  ]
  return schema
}

export default LPLPOTableSchema
