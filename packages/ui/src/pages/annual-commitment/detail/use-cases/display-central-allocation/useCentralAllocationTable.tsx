import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { TItem } from '../../annual-commitment-detail.service'

export const useCentralAllocationTable = () => {
  const { t, i18n } = useTranslation(['annualCommitmentDetail'])

  const columns: ColumnDef<TItem>[] = useMemo(
    () => [
      {
        accessorKey: 'no',
        header: t('annualCommitmentDetail:table.column.no'),
        cell: ({ row }) => row.index + 1,
        size: 60,
      },
      {
        accessorKey: 'material',
        header: t('annualCommitmentDetail:table.column.material'),
        cell: ({ row }) => row.original.material?.name ?? '-',
      },
      {
        accessorKey: 'provinceReceiver',
        header: t('annualCommitmentDetail:table.column.provinceReceiver'),
        cell: ({ row }) => row.original.province?.name ?? '-',
      },
      {
        accessorKey: 'numberVial',
        header: t('annualCommitmentDetail:table.column.numberVial'),
        cell: ({ row }) =>
          numberFormatter(row.original.vial_quantity, i18n.language),
        size: 150,
      },
      {
        accessorKey: 'numberDose',
        header: t('annualCommitmentDetail:table.column.numberDose'),
        cell: ({ row }) =>
          numberFormatter(row.original.dose_quantity, i18n.language),
        size: 150,
      },
    ],
    [t, i18n.language]
  )

  return {
    columns,
  }
}
