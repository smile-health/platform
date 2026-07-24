import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import {
  Stock,
  TransactionReasons,
} from '../../disposal-instruction-detail.type'
import { useDisposalItems } from './useDisposalItems'

type QtyDetailTableItem = {
  stock: Stock
  instruction_disposal_stocks: Array<{
    disposal_discard_qty?: number
    disposal_received_qty?: number
    transaction_reasons?: TransactionReasons
  }>
}

export const QtyDetailTable = () => {
  const { t, i18n } = useTranslation(['common', 'disposalInstructionDetail'])

  const disposalItems = useDisposalItems()

  const tableData =
    disposalItems.selectedDisposalItem?.instruction_disposal_stocks?.reduce(
      (acc: QtyDetailTableItem[], data) => {
        const similarBatchIndex = acc.findIndex(
          (item) => item.stock?.batch_id === data.stock?.batch_id
        )
        const isBatchExist = similarBatchIndex !== -1

        if (isBatchExist) {
          acc[similarBatchIndex].instruction_disposal_stocks.push({
            disposal_discard_qty: data.disposal_discard_qty,
            disposal_received_qty: data.disposal_received_qty,
            transaction_reasons: data.transaction_reasons,
          })
          return acc
        }

        return [
          ...acc,
          {
            stock: data.stock,
            instruction_disposal_stocks: [
              {
                disposal_discard_qty: data.disposal_discard_qty,
                disposal_received_qty: data.disposal_received_qty,
                transaction_reasons: data.transaction_reasons,
              },
            ],
          },
        ]
      },
      []
    )

  const columns: ColumnDef<QtyDetailTableItem>[] = [
    {
      accessorKey: 'batch_info',
      header: t('disposalInstructionDetail:data.batch_info'),
      size: 220,
      cell: ({ row }) => {
        return (
          <div>
            <div className="ui-font-semibold">
              {row.original?.stock?.batch?.code ?? '-'}
            </div>
            {row.original.instruction_disposal_stocks?.map((stock) => (
              <div key={stock.transaction_reasons?.id}>
                {stock.transaction_reasons?.title}:{' '}
                {numberFormatter(
                  (stock.disposal_discard_qty ?? 0) +
                    (stock.disposal_received_qty ?? 0),
                  i18n.language
                )}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'disposal_instruction_from_internal',
      header: t(
        'disposalInstructionDetail:data.disposal_instruction_from_internal'
      ),
      cell: ({ row }) => {
        return (
          <div>
            {row.original.instruction_disposal_stocks?.map((stock) => (
              <div key={stock.transaction_reasons?.id}>
                {stock.transaction_reasons?.title}:{' '}
                {numberFormatter(stock.disposal_discard_qty, i18n.language)}
              </div>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: 'disposal_instruction_from_external',
      header: t(
        'disposalInstructionDetail:data.disposal_instruction_from_external'
      ),
      cell: ({ row }) => {
        return (
          <div>
            {row.original.instruction_disposal_stocks?.map((stock) => (
              <div key={stock.transaction_reasons?.id}>
                {stock.transaction_reasons?.title}:{' '}
                {numberFormatter(stock.disposal_received_qty, i18n.language)}
              </div>
            ))}
          </div>
        )
      },
    },
  ]

  return <DataTable data={tableData} columns={columns} />
}
