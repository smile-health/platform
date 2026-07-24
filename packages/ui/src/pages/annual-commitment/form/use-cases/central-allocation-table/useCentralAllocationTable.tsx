import { memo, useCallback, useMemo } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { loadProvinces } from '#services/location'
import { numberFormatter } from '#utils/formatter'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NumberFormatValues } from 'react-number-format'

import { CentralAllocationItem } from '../../annual-commitment-form.type'
import { useAnnualCommitmentForm } from '../../AnnualCommitmentFormContext'

export const useCentralAllocationTable = () => {
  const { t, i18n } = useTranslation(['common', 'annualCommitmentForm'])
  const { centralAllocations, form, removeCentralAllocation } =
    useAnnualCommitmentForm()

  const handleProvinceChange = useCallback(
    (option: OptionType | null, rowIndex: number) => {
      form.methods.setValue(
        `centralAllocations.${rowIndex}.provinceReceiver`,
        option,
        { shouldValidate: true, shouldDirty: true }
      )
    },
    [form.methods]
  )

  const handleVialChange = useCallback(
    (values: NumberFormatValues, rowIndex: number, piecesPerUnit: number) => {
      const vial = values.floatValue ?? null
      form.methods.setValue(`centralAllocations.${rowIndex}.numberVial`, vial)

      const dose = vial ? vial * piecesPerUnit : null
      form.methods.setValue(`centralAllocations.${rowIndex}.numberDose`, dose)

      form.methods.trigger('centralAllocations')
    },
    [form.methods.setValue, form.methods.trigger]
  )

  const columns: ColumnDef<CentralAllocationItem>[] = useMemo(
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
        cell: ({ row }) => {
          return (
            <div className="ui-my-2">{row.original.material?.label ?? '-'}</div>
          )
        },
      },
      {
        accessorKey: 'provinceReceiver',
        header: t('annualCommitmentForm:table.column.provinceReceiver'),
        size: 200,
        minSize: 200,
        cell: ({ row }) => (
          <Controller
            control={form?.methods?.control}
            name={`centralAllocations.${row.index}.provinceReceiver`}
            render={({ field, fieldState }) => (
              <div>
                <ReactSelectAsync
                  value={field.value}
                  loadOptions={loadProvinces}
                  debounceTimeout={300}
                  isClearable
                  onChange={(option) =>
                    handleProvinceChange(option as OptionType | null, row.index)
                  }
                  menuPosition="fixed"
                  additional={{ page: 1 }}
                  menuPortalTarget={document.body}
                  className="ui-min-w-48"
                  error={!!fieldState.error?.message}
                />
                {fieldState.error && (
                  <FormErrorMessage>
                    {fieldState.error.message}
                  </FormErrorMessage>
                )}
              </div>
            )}
          />
        ),
      },
      {
        accessorKey: 'numberVial',
        header: t('annualCommitmentForm:table.column.numberVial'),
        cell: ({ row }) => {
          return (
            <Controller
              control={form?.methods?.control}
              name={`centralAllocations.${row.index}.numberVial`}
              render={({ field, fieldState }) => {
                return (
                  <div>
                    <InputNumberV2
                      value={field.value ?? ''}
                      onValueChange={(values) => {
                        handleVialChange(
                          values,
                          row.index,
                          row.original.piecesPerUnit ?? 1
                        )
                      }}
                      placeholder="0"
                      className="ui-w-32"
                      error={!!fieldState.error?.message}
                    />
                    {fieldState.error && (
                      <FormErrorMessage className="ui-mt-2">
                        {fieldState.error.message}
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
              form.methods.watch(`centralAllocations.${row.index}.numberDose`),
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
            onClick={() => removeCentralAllocation(row.index)}
          >
            {t('annualCommitmentForm:button.remove')}
          </Button>
        ),
        size: 100,
      },
    ],
    [t, i18n.language, form?.methods, handleProvinceChange, handleVialChange]
  )

  return {
    columns,
    data: centralAllocations.fields,
  }
}
