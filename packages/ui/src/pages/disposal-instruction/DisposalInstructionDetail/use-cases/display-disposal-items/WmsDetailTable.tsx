import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '#components/badge'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { WasteInfo } from '../../disposal-instruction-detail.type'
import { useDisposalItems } from './useDisposalItems'

export const WmsDetailTable = () => {
  const { t } = useTranslation(['common', 'disposalInstructionDetail'])

  const disposalItems = useDisposalItems()

  const columns: ColumnDef<WasteInfo>[] = [
    {
      accessorKey: 'waste_bag_codes',
      header: t('disposalInstructionDetail:data.waste_bag_code'),
      meta: {
        cellClassName: cx('ui-font-semibold'),
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const sortedWasteBagHistoriesByUpdatedAt =
          row.original.waste_bag_histories?.sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
          ) ?? []
        const latestWasteBagHistory = sortedWasteBagHistoriesByUpdatedAt[0]

        return (
          <Badge
            rounded="full"
            color="neutral"
            variant="light"
            className="ui-py-2 ui-px-6"
          >
            {latestWasteBagHistory.status_label}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'waste_bag_type_label',
      header: t('disposalInstructionDetail:data.waste_type'),
    },
    {
      accessorKey: 'waste_bag_total_weight',
      header: t('disposalInstructionDetail:data.weight_per_bag'),
    },
    {
      accessorKey: 'action',
      header: t('common:action'),
      cell: ({ row }) => {
        return (
          <Button
            id="btn-link-budget-source-detail"
            size="sm"
            variant="subtle"
            onClick={() => disposalItems.wmsStatusHistoryModal.show(row)}
          >
            {t('disposalInstructionDetail:button.view_history')}
          </Button>
        )
      },
    },
  ]

  return (
    <DataTable
      data={disposalItems.selectedDisposalItem?.waste_info ?? []}
      columns={columns}
    />
  )
}
