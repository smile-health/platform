import { useCallback, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { numberFormatter } from '#utils/formatter'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NumberFormatValues } from 'react-number-format'

import { BufferItem } from '../../annual-commitment-form.type'
import { useAnnualCommitmentForm } from '../../AnnualCommitmentFormContext'

export const useBufferTable = () => {
  const { t, i18n } = useTranslation(['common', 'annualCommitmentForm'])
  const { bufferItems, form, removeBufferItem } = useAnnualCommitmentForm()

  const handleVialChange = useCallback(
    (values: NumberFormatValues, rowIndex: number, piecesPerUnit: number) => {
      form.methods.setValue(
        `bufferItems.${rowIndex}.numberVial`,
        values.floatValue ?? null,
        { shouldValidate: true, shouldDirty: true }
      )

      form.methods.setValue(
        `bufferItems.${rowIndex}.numberDose`,
        values.floatValue ? values.floatValue * piecesPerUnit : null,
        { shouldValidate: true }
      )

      // Trigger array-level validation to clear/show section error
      form.methods.trigger('centralAllocations')
    },
    [form.methods]
  )

  const columns: ColumnDef<BufferItem>[] = useMemo(
    () => [
      {
        accessorKey: 'no',
        header: t('annualCommitmentForm:table.column.no'),

        cell: ({ row }) => <div className="ui-my-2">{row.index + 1}</div>,
        size: 60,
      },
      {
        accessorKey: 'materialName',
        header: t('annualCommitmentForm:table.column.materialName'),
        cell: ({ row }) => (
          <div className="ui-my-2">{row.original.material?.label ?? '-'}</div>
        ),
      },
      {
        accessorKey: 'numberVial',
        header: t('annualCommitmentForm:table.column.numberVial'),
        cell: ({ row }) => {
          return (
            <Controller
              name={`bufferItems.${row.index}.numberVial`}
              control={form.methods.control}
              render={({ field }) => {
                return (
                  <div>
                    <InputNumberV2
                      value={field.value ?? ''}
                      onValueChange={(values) =>
                        handleVialChange(
                          values,
                          row.index,
                          row.original.piecesPerUnit ?? 1
                        )
                      }
                      placeholder="0"
                      className="ui-w-32"
                      error={
                        !!form?.errors?.bufferItems?.[row.index]?.numberVial
                      }
                    />
                    {form?.errors?.bufferItems?.[row.index]?.numberVial && (
                      <FormErrorMessage className="ui-mt-2">
                        {
                          form?.errors?.bufferItems?.[row.index]?.numberVial
                            ?.message
                        }
                      </FormErrorMessage>
                    )}
                  </div>
                )
              }}
            />
          )
        },
        size: 150,
      },
      {
        accessorKey: 'numberDose',
        header: t('annualCommitmentForm:table.column.numberDose'),
        cell: ({ row }) => (
          <div className="ui-my-2">
            {numberFormatter(
              form.methods.watch(`bufferItems.${row.index}.numberDose`),
              i18n.language
            )}
          </div>
        ),
        size: 150,
      },
      {
        accessorKey: 'action',
        header: t('annualCommitmentForm:table.column.action'),
        cell: ({ row }) => (
          <Button
            variant="subtle"
            className="ui-text-danger-500"
            onClick={() => removeBufferItem(row.index)}
          >
            {t('annualCommitmentForm:button.remove')}
          </Button>
        ),
        size: 100,
      },
    ],
    [t, i18n.language, form.errors, handleVialChange]
  )

  return {
    columns,
    data: bufferItems.fields,
  }
}
