import { ColumnDef } from '@tanstack/react-table'
import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'

import ReconciliationChart from './components/ReconciliationChart'
import ReconciliationTable from './components/ReconciliationTable'
import { TReconciliationEntity } from './reconciliation.type'

export function getReconciliationTabs(t: TFunction<'reconciliationReport'>) {
  return [
    {
      id: 'all',
      label: t('title.tab.all'),
      component: ReconciliationChart,
    },
    {
      id: 'entity',
      label: t('title.tab.entity'),
      component: ReconciliationTable,
    },
  ]
}

export const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf']

export function entityColumns(
  t: TFunction<'reconciliationReport'>,
  months: OptionType[],
  page: number,
  paginate: number
) {
  const monthColumns: Array<ColumnDef<TReconciliationEntity>> = months.map(
    (month) => ({
      header: month.label,
      accessorKey: 'months',
      size: 100,
      minSize: 100,
      cell: ({ getValue }) => {
        const monthMap = getValue<Record<string, number>>()

        return monthMap[month?.value]
      },
    })
  )
  const schema: Array<ColumnDef<TReconciliationEntity>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      maxSize: 40,
      cell: ({ row }) => (page - 1) * paginate + (row?.index + 1),
    },
    {
      header: t('columns.entity'),
      accessorKey: 'name',
      size: 220,
      minSize: 220,
    },
    ...monthColumns,
    {
      header: t('columns.frequency.total'),
      accessorKey: 'total',
      size: 100,
      minSize: 100,
    },
    {
      header: t('columns.frequency.average'),
      accessorKey: 'average',
      size: 100,
      minSize: 100,
    },
  ]

  return schema
}
