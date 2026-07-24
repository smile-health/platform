import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import { DisposalItem } from '../../disposal-instruction-detail.type'
import { useDisposalInstructionDetail } from '../../DisposalInstructionDetailContext'
import { useDisposalItems } from './useDisposalItems'

export const DisposalItemsTable = () => {
  const { t } = useTranslation(['common', 'disposalInstructionDetail'])

  const disposalInstructionDetail = useDisposalInstructionDetail()
  const disposalItems = useDisposalItems()

  const columns: ColumnDef<DisposalItem>[] = [
    {
      accessorKey: 'material_id',
      header: 'Material',
      cell: ({ row }) => row.original.master_material?.name,
    },
    {
      accessorKey: 'qty',
      header: 'Qty',
      cell: ({ row }) => {
        return (
          <div className="space-y-1">
            <div>{row.original.qty}</div>
            <button
              className="ui-text-primary-500 !ui-outline-none"
              onClick={() => disposalItems.qtyDetailModal.show(row)}
            >
              {t('disposalInstructionDetail:button.view_qty_detail')}
            </button>
          </div>
        )
      },
    },
    {
      accessorKey: 'waste_info',
      header: t('disposalInstructionDetail:data.waste_bag_code'),
      cell: ({ row }) => {
        const hasInfo = Boolean(row.original.waste_info?.length)
        return (
          <div className="space-y-1">
            <div>
              {hasInfo
                ? row.original.waste_info
                    ?.map((info) => info.waste_bag_codes)
                    .join(', ')
                : '-'}
            </div>
            {hasInfo && (
              <button
                className="ui-text-primary-500 !ui-outline-none"
                onClick={() => disposalItems.wmsDetailDrawer.show(row)}
              >
                {t('disposalInstructionDetail:button.view_wms_detail')}
              </button>
            )}
          </div>
        )
      },
      meta: {
        hidden: !disposalInstructionDetail.isWmsAvailable,
      },
    },
  ]

  return (
    <DataTable
      data={disposalInstructionDetail.data?.disposal_items ?? []}
      columns={columns}
      isLoading={!disposalInstructionDetail.data}
      isStriped
      isHighlightedOnHover
    />
  )
}
