import { useMemo } from 'react'
import { parseDateTime } from '@internationalized/date'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { DatePicker } from '#components/date-picker'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Input } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import { ReactSelect } from '#components/react-select'
import { parseValidDate } from '#utils/date'
import dayjs from 'dayjs'
import { Controller, useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  TicketingSystemCreateSelectedMaterial,
  TicketingSystemCreateSelectedMaterialQtyItem,
} from '../../ticketing-system-create.type'
import useTicketingSystemCreateAddQtyItem from './useTicketingSystemCreateAddQtyItem'

const TicketingSystemCreateAddQtyItemTable = () => {
  const { t } = useTranslation('ticketingSystemCreate')

  const { reasonOptionsQuery } = useTicketingSystemCreateAddQtyItem()

  const form = useFormContext<TicketingSystemCreateSelectedMaterial>()
  const { append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const columns = useMemo<
    ColumnDef<TicketingSystemCreateSelectedMaterialQtyItem>[]
  >(
    () => [
      {
        header: t('table.columns.no'),
        accessorKey: 'no',
        cell: ({ row }) => row.index + 1,
      },
      {
        header: t('table.columns.batch_name'),
        accessorKey: 'batch_code',
        cell: ({ row }) => (
          <Controller
            name={`items.${row.index}.batch_code`}
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="ui-space-y-1">
                <Input
                  {...field}
                  value={field.value ?? ''}
                  aria-label={field.name}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                  }}
                  placeholder={t('field.batch_code.placeholder')}
                  className="ui-text-sm"
                  error={Boolean(fieldState.error?.message)}
                />
                {fieldState.error?.message && (
                  <FormErrorMessage>
                    {fieldState.error?.message}
                  </FormErrorMessage>
                )}
              </div>
            )}
          />
        ),
        meta: {
          hidden: Boolean(form.watch('material'))
            ? !form.watch('material.is_batch')
            : !form.watch('custom_material.is_batch'),
        },
      },
      {
        header: t('table.columns.expired_date'),
        accessorKey: 'expired_date',
        cell: ({ row }) => {
          return (
            <Controller
              name={`items.${row.index}.expired_date`}
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="ui-space-y-1">
                  <DatePicker
                    name={field.name}
                    id={field.name}
                    aria-label={field.name}
                    value={field.value ? parseValidDate(field.value) : null}
                    minValue={parseDateTime(
                      dayjs('12-31-2019').format('YYYY-MM-DD')
                    )}
                    onChange={(date) => {
                      const newDate = new Date(date?.toString())
                      field.onChange(dayjs(newDate).format('YYYY-MM-DD'))
                    }}
                    error={Boolean(fieldState.error)}
                  />
                  {fieldState.error?.message && (
                    <FormErrorMessage>
                      {fieldState.error?.message}
                    </FormErrorMessage>
                  )}
                </div>
              )}
            />
          )
        },
      },
      {
        header: t('table.columns.quantity'),
        accessorKey: 'quantity',
        cell: ({ row }) => (
          <Controller
            name={`items.${row.index}.qty`}
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="ui-space-y-1">
                <InputNumberV2
                  {...field}
                  id={field.name}
                  aria-label={field.name}
                  placeholder={t('field.quantity.placeholder')}
                  value={field?.value ?? ''}
                  className="ui-text-sm"
                  onChange={() => {}}
                  onValueChange={(values) => {
                    field.onChange(values?.floatValue ?? null)
                  }}
                  error={Boolean(fieldState.error)}
                />
                {fieldState.error?.message && (
                  <FormErrorMessage>
                    {fieldState.error?.message}
                  </FormErrorMessage>
                )}
              </div>
            )}
          />
        ),
      },
      {
        header: t('table.columns.reason'),
        accessorKey: 'reason',
        cell: ({ row }) => (
          <Controller
            name={`items.${row.index}.reason`}
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="ui-space-y-1">
                <ReactSelect
                  {...field}
                  options={reasonOptionsQuery.data}
                  placeholder={t('field.reason.placeholder')}
                  classNames={{
                    control: () => 'ui-text-sm',
                  }}
                  onChange={(option) => {
                    field.onChange(option)
                    form.setValue(`items.${row.index}.child_reason`, null)
                  }}
                  isClearable
                  isSearchable
                  error={Boolean(fieldState.error)}
                  menuPosition="fixed"
                />
                {fieldState.error?.message && (
                  <FormErrorMessage>
                    {fieldState.error?.message}
                  </FormErrorMessage>
                )}
              </div>
            )}
          />
        ),
      },
      {
        header: t('table.columns.reason_detail'),
        accessorKey: 'child_reason',
        cell: ({ row }) => {
          const selectedReason = form.watch(`items.${row.index}.reason`)
          const isReasonSelected = Boolean(selectedReason)

          return (
            <Controller
              name={`items.${row.index}.child_reason`}
              control={form.control}
              render={({ field, fieldState }) => (
                <div className="ui-space-y-1">
                  <ReactSelect
                    {...field}
                    options={selectedReason?.child || []}
                    placeholder={t('field.reason_detail.placeholder')}
                    classNames={{
                      control: () => 'ui-text-sm',
                    }}
                    onChange={(option) => {
                      field.onChange(option)
                    }}
                    disabled={!isReasonSelected}
                    error={Boolean(fieldState.error)}
                    menuPosition="fixed"
                  />
                  {fieldState.error?.message && (
                    <FormErrorMessage>
                      {fieldState.error?.message}
                    </FormErrorMessage>
                  )}
                </div>
              )}
            />
          )
        },
      },
      {
        accessorKey: 'action',
        header: t('table.columns.action'),
        cell: ({ row }) => (
          <Button
            data-testid={`remove-material-quantity-${row.index}`}
            size="sm"
            variant="subtle"
            className="ui-px-1.5 ui-text-danger-500"
            disabled={form.watch('items').length <= 1}
            onClick={() => remove(row.index)}
          >
            {t('common:remove')}
          </Button>
        ),
      },
    ],
    [
      t,
      reasonOptionsQuery.data,
      form.watch('items'),
      form.watch('custom_material.is_batch'),
    ]
  )

  return (
    <div className="ui-space-y-6">
      <DataTable data={form.watch('items')} columns={columns} />

      {Boolean(
        form.watch('material')
          ? form.watch('material.is_batch')
          : form.watch('custom_material.is_batch')
      ) && (
        <Button
          variant="outline"
          leftIcon={<Plus className="ui-size-5" />}
          className="ui-min-w-44"
          onClick={() =>
            append({
              batch_code: null,
              expired_date: null,
              production_date: null,
              qty: null,
              reason: null,
              child_reason: null,
            })
          }
        >
          {t('button.add_other_batch')}
        </Button>
      )}
    </div>
  )
}

export default TicketingSystemCreateAddQtyItemTable
