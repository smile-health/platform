import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { DisposalInstructionCreateFormValues } from '../../disposal-instruction-create.type'
import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import { useBatchQtyForm } from '../fill-batch-qty-form/BatchQtyFormContext'
import { useMaterialSelection } from '../material-selection/useMaterialSelection'

export const useDisposalTable = () => {
  const { i18n, t } = useTranslation([
    'common',
    'disposalInstruction',
    'disposalInstructionCreate',
  ])

  const disposalInstructionCreate = useDisposalInstructionCreate()
  const materialSelection = useMaterialSelection()
  const batchQtyForm = useBatchQtyForm()

  const columns: ColumnDef<DisposalInstructionCreateFormValues.DisposalItem>[] =
    [
      {
        accessorKey: 'number',
        header: t('disposalInstructionCreate:table.column.si_no'),
        cell: ({ row }) => {
          return row.index + 1
        },
      },
      {
        accessorKey: 'material.name',
        header: t('disposalInstructionCreate:table.column.material_info'),
        cell: ({ row }) => {
          return (
            <div className="space-y-1">
              <div className="ui-text-dark-teal ui-font-bold">
                {row.original.material?.name}
              </div>
              <div>
                {t('disposalInstruction:data.activity')}:{' '}
                {row.original.material?.activities
                  .map((activity) => activity.name)
                  .join(', ')}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'qty',
        header: t('disposalInstructionCreate:table.column.total_discard'),
        cell: ({ row }) => {
          const qty = row.original?.qty
          return (
            <div className="space-y-1">
              {numberFormatter(qty, i18n.language)}
            </div>
          )
        },
      },
      {
        accessorKey: 'total_discard',
        header: t('disposalInstructionCreate:table.column.quantity'),
        cell: ({ row }) => {
          const filledStocks = row.original.stocks.filter((stock) =>
            stock.disposal_stocks?.some(
              (disposalStock) =>
                disposalStock.received_qty != null ||
                disposalStock.discard_qty != null
            )
          )
          const isStockFilled = Boolean(filledStocks.length)
          const errorMessage =
            disposalInstructionCreate.form.errors.disposal_items?.[row.index]
              ?.stocks?.message

          const label = row.original.material?.is_managed_in_batch
            ? isStockFilled
              ? t('disposalInstructionCreate:button.update_batch_quantity')
              : t('disposalInstructionCreate:button.add_batch_quantity')
            : isStockFilled
              ? t('disposalInstructionCreate:button.update_quantity')
              : t('disposalInstructionCreate:button.add_quantity')

          return (
            <div className="ui-space-y-4">
              {isStockFilled && (
                <div className="ui-space-y-2">
                  {filledStocks.map((stock) => (
                    <div>
                      <div className="ui-font-bold ui-text-dark-teal ui-mb-1">
                        {stock.batch?.code ?? '-'}
                      </div>
                      <div className="space-y-1">
                        {stock.disposal_stocks
                          ?.filter(
                            (disposalStock) =>
                              disposalStock.discard_qty ??
                              disposalStock.received_qty
                          )
                          .map((disposalStock) => (
                            <div>
                              {disposalStock.transaction_reasons?.title}:{' '}
                              {disposalStock.discard_qty ??
                                disposalStock.received_qty}
                            </div>
                          ))}
                      </div>
                      <div></div>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                <Button
                  onClick={() => batchQtyForm.drawer.open(row)}
                  leftIcon={<Plus className="h-5 w-5" />}
                  type="button"
                  variant="outline"
                  className="ui-w-50"
                  id={`button-add-batch-qty-${row.index}`}
                >
                  {label}
                </Button>
                {Boolean(errorMessage) && (
                  <FormErrorMessage>{errorMessage}</FormErrorMessage>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'action',
        header: t('disposalInstructionCreate:table.column.action'),
        cell: ({ row }) => {
          return (
            <Button
              id={`btn-delete-${row.index}`}
              size="sm"
              variant="subtle"
              color="danger"
              className="ui-p-[6px]"
              type="button"
              onClick={() => {
                if (row.original.material) {
                  materialSelection.removeMaterial(row.original.material.id)
                }
              }}
            >
              {t('common:remove')}
            </Button>
          )
        },
      },
    ]

  return { columns }
}
