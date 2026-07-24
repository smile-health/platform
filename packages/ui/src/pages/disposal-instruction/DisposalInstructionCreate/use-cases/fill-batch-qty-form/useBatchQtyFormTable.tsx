import { useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import cx from '#lib/cx'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { DisposalInstructionCreateFormValues } from '../../disposal-instruction-create.type'
import { useBatchQtyForm } from './BatchQtyFormContext'

export const useBatchQtyFormTable = () => {
  const { i18n, t } = useTranslation(['disposalInstructionCreate'])

  const batchQtyForm = useBatchQtyForm()

  const columns: ColumnDef<DisposalInstructionCreateFormValues.Stock>[] =
    useMemo(
      () => [
        {
          accessorKey: 'number',
          header: t('disposalInstructionCreate:table.column.si_no'),
          size: 75,
          cell: ({ row }) => row.index + 1,
        },
        {
          accessorKey: 'batch_info',
          header: t('disposalInstructionCreate:table.column.batch_info'),
          cell: ({ row }) => {
            return (
              <div className="ui-text-dark-teal">
                <div className="ui-font-bold ui-text-primary-800 ui-mb-1">
                  {row.original.batch?.code || '-'}
                </div>
                <div>
                  {t('disposalInstructionCreate:table.column.production_date')}:{' '}
                  {parseDateTime(
                    row.original.batch?.production_date || '-',
                    'DD MMM YYYY'
                  ).toUpperCase()}
                </div>
                <div>
                  {t('disposalInstructionCreate:table.column.manufacturer')}:{' '}
                  {row.original.batch?.manufacture.name}
                </div>
                <div>
                  {t('disposalInstructionCreate:table.column.expired_date')}:{' '}
                  {parseDateTime(
                    row.original.batch?.expired_date || '-',
                    'DD MMM YYYY'
                  ).toUpperCase()}
                </div>
              </div>
            )
          },
          meta: {
            hidden:
              !batchQtyForm.data.selectedDisposalItem?.material
                ?.is_managed_in_batch,
          },
        },
        {
          accessorKey: 'activity',
          header: t('disposalInstructionCreate:table.column.activity'),
          cell: ({ row }) => {
            return row.original.activity.name
          },
        },
        {
          accessorKey: 'disposal_discard_qty',
          header: t(
            'disposalInstructionCreate:table.column.discard_from_internal'
          ),
          meta: {
            cellClassName: cx('ui-bg-gray-200 ui-bg-opacity-50'),
          },
        },
        {
          accessorKey: 'disposal_instruction_qty_from_internal',
          header: t(
            'disposalInstructionCreate:table.column.disposal_instruction_qty_from_internal'
          ),
          cell: ({ row, column }) => {
            const id = `select_disposal_instruction_qty_from_internal-${column.id}-${row.id}`

            return (
              <div className="ui-space-y-4">
                {row.original.disposal_stocks?.map((disposalStock, index) => {
                  const errorMessage =
                    batchQtyForm.errors.stocks?.[row.index]?.disposal_stocks?.[
                      index
                    ]?.discard_qty?.message

                  return (
                    <FormControl>
                      <FormLabel htmlFor={id}>
                        {disposalStock.transaction_reasons?.title} (
                        {numberFormatter(
                          disposalStock.disposal_discard_qty,
                          i18n.language
                        )}
                        )
                      </FormLabel>
                      <InputNumberV2
                        {...batchQtyForm.methods.register(
                          `stocks.${row.index}.disposal_stocks.${index}.discard_qty`
                        )}
                        id={id}
                        placeholder=""
                        value={
                          batchQtyForm.methods.watch(
                            `stocks.${row.index}.disposal_stocks.${index}.discard_qty`
                          ) ?? ''
                        }
                        onValueChange={(e) => {
                          batchQtyForm.methods.setValue(
                            `stocks.${row.index}.disposal_stocks.${index}.discard_qty`,
                            e?.floatValue ?? null
                          )
                        }}
                        error={!!errorMessage}
                        disabled={
                          Number(disposalStock.disposal_discard_qty) === 0
                        }
                      />
                      {errorMessage && (
                        <FormErrorMessage>{errorMessage}</FormErrorMessage>
                      )}
                    </FormControl>
                  )
                })}
              </div>
            )
          },
        },
        {
          accessorKey: 'disposal_received_qty',
          header: t(
            'disposalInstructionCreate:table.column.discard_from_external'
          ),
          meta: {
            cellClassName: cx('ui-bg-gray-200 ui-bg-opacity-50'),
          },
        },
        {
          accessorKey: 'disposal_instruction_qty_from_external',
          header: t(
            'disposalInstructionCreate:table.column.disposal_instruction_qty_from_external'
          ),
          cell: ({ row, column }) => {
            const id = `select_disposal_instruction_qty_from_external-${column.id}-${row.id}`

            return (
              <div className="ui-space-y-4">
                {row.original.disposal_stocks?.map((disposalStock, index) => {
                  const errorMessage =
                    batchQtyForm.errors.stocks?.[row.index]?.disposal_stocks?.[
                      index
                    ]?.received_qty?.message

                  return (
                    <FormControl>
                      <FormLabel htmlFor={id}>
                        {disposalStock.transaction_reasons?.title} (
                        {numberFormatter(
                          disposalStock.disposal_received_qty,
                          i18n.language
                        )}
                        )
                      </FormLabel>
                      <InputNumberV2
                        {...batchQtyForm.methods.register(
                          `stocks.${row.index}.disposal_stocks.${index}.received_qty`
                        )}
                        id={id}
                        placeholder=""
                        value={
                          batchQtyForm.methods.watch(
                            `stocks.${row.index}.disposal_stocks.${index}.received_qty`
                          ) ?? ''
                        }
                        onValueChange={(e) => {
                          batchQtyForm.methods.setValue(
                            `stocks.${row.index}.disposal_stocks.${index}.received_qty`,
                            e?.floatValue ?? null
                          )
                        }}
                        error={!!errorMessage}
                        disabled={
                          Number(disposalStock.disposal_received_qty) === 0
                        }
                      />
                      {errorMessage && (
                        <FormErrorMessage>{errorMessage}</FormErrorMessage>
                      )}
                    </FormControl>
                  )
                })}
              </div>
            )
          },
        },
      ],
      [batchQtyForm.methods, batchQtyForm.errors]
    )

  return {
    data: batchQtyForm.data.selectedDisposalItem?.stocks ?? [],
    columns,
  }
}
