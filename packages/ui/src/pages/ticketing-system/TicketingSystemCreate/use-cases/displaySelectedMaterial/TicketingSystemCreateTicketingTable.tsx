import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import { DataTable } from '#components/data-table'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Td, Tr } from '#components/table'
import { TextArea } from '#components/text-area'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'
import { useTicketingSystemCreateContext } from '../../TicketingSystemCreateProvider'
import TicketingSystemCreateMaterialSelectionDropdown from '../materialSelection/TicketingSystemCreateMaterialSelectionDropdown'

const TicketingSystemCreateTicketingTable = () => {
  const { t, i18n } = useTranslation('ticketingSystemCreate')
  const { form, materialSelection, addQtyItem } =
    useTicketingSystemCreateContext()

  const columns: ColumnDef<TicketingSystemCreateSelectedMaterial>[] = [
    {
      accessorKey: 'no',
      header: t('table.columns.si_no'),
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'material.name',
      header: t('table.columns.selected_material'),
      cell: ({ row }) => {
        const isCustomMaterial = !row.original.material

        if (isCustomMaterial) {
          return Boolean(row.original.custom_material?.name) ? (
            <div>
              <div>{row.original.custom_material?.name}</div>
              <div className="ui-text-sm ui-font-normal ui-text-neutral-500">
                ({t('text.new_material')})
              </div>
            </div>
          ) : (
            <div>
              -
              <br />
              <span className="ui-text-danger-500">
                {t('table.message.edit_material_name')}
              </span>
            </div>
          )
        }

        return row.original.material?.name ?? '-'
      },
    },
    {
      accessorKey: 'quantity',
      header: t('table.columns.quantity'),
      cell: ({ row }) => {
        const hasQtyItems = row.original.items.some((item) => Boolean(item.qty))
        const rowErrorMessage =
          form.formState.errors.selected_materials?.[row.index]?.items?.message

        if (hasQtyItems) {
          return (
            <div className="ui-gap-5 ui-items-start inline-flex flex-col">
              {row.original.items.map((item, index) => (
                <div key={index}>
                  <div className="font-bold">{item.batch_code}</div>
                  <div>
                    {t('table.columns.expired_date')}:{' '}
                    <span className="uppercase">
                      {item.expired_date
                        ? dayjs(item.expired_date).format('DD MMM YYYY')
                        : '-'}
                    </span>
                  </div>
                  <div>
                    {t('table.columns.quantity')}:{' '}
                    {item?.qty ? numberFormatter(item.qty, i18n.language) : '-'}
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={() => addQtyItem.selectMaterialRow(row, 'edit')}
                className="ui-px-4"
              >
                {t('button.edit_quantity')}
              </Button>
            </div>
          )
        }

        return (
          <div className="space-y-1">
            <Button
              variant="outline"
              leftIcon={<Plus />}
              onClick={() => addQtyItem.selectMaterialRow(row, 'add')}
            >
              {t('button.input_quantity')}
            </Button>
            {rowErrorMessage && (
              <FormErrorMessage>{rowErrorMessage}</FormErrorMessage>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'reason',
      header: t('table.columns.reason'),
      cell: ({ row }) => (
        <div className="ui-gap-9 flex flex-col">
          {row.original.items.map((item) => (
            <div>
              <div>
                {t('field.reason.label')}: {item.reason?.label ?? '-'}
              </div>
              <div>
                {t('field.reason_detail.label')}:{' '}
                {item.child_reason?.label ?? '-'}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      accessorKey: 'action',
      header: t('table.columns.action'),
      cell: ({ row }) => (
        <Button
          data-testid={`remove-material-${row.original.material?.id}`}
          size="sm"
          variant="subtle"
          className="ui-px-1.5 ui-text-danger-500"
          onClick={() => materialSelection.removeSelected(row.index)}
        >
          {t('common:remove')}
        </Button>
      ),
    },
  ]

  return (
    <div className="ui-w-full ui-px-5 ui-py-5 ui-border ui-border-gray-300 ui-rounded ui-space-y-6">
      <div className="space-y-2">
        <div className="ui-mb-3 ui-font-semibold ui-text-gray-800">
          {t('section.ticketing_table.title')}
        </div>
        <div className="ui-bg-amber-100 ui-border ui-border-amber-300 ui-rounded ui-p-4 ui-text-amber-700 ui-text-sm">
          <ul className="ui-list-disc ui-pl-5 ui-space-y-1">
            <li>{t('section.ticketing_table.instructions.instruction_1')}</li>
            <li>{t('section.ticketing_table.instructions.instruction_2')}</li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <div
          className={cx({
            'ui-outline ui-outline-2 ui-outline-red-500/80 ui-bg-red-50 ui-rounded-sm ui-outline-offset-1':
              form.formState.errors.selected_materials?.message,
          })}
        >
          <DataTable
            data={materialSelection.selectedMaterials}
            columns={columns}
            withCustomRow={materialSelection.selectedMaterials?.length > 0}
            customRow={
              <Tr className="ui-border-t">
                <Td colSpan={columns.length}>
                  <TicketingSystemCreateMaterialSelectionDropdown />
                </Td>
              </Tr>
            }
          />
        </div>

        {form.formState.errors.selected_materials?.message && (
          <FormErrorMessage>
            {form.formState.errors.selected_materials?.message}
          </FormErrorMessage>
        )}
      </div>

      {Number(form.watch('has_order')) === 1 && (
        <div className="space-y-4">
          <div className="ui-font-semibold ui-text-gray-800">
            {t('section.order_ticketing_confirmation.title')}
          </div>
          <Controller
            name="accept_terms"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="ui-space-y-1">
                <div
                  className={cx({
                    'ui-outline-red-500/40 ui-bg-red-50 ui-text-red-500 ui-outline ui-outline-1 ui-outline-offset-2 inline-block rounded-sm':
                      fieldState.error?.message,
                  })}
                >
                  <Checkbox
                    {...field}
                    value={field.name}
                    label={t('field.accept_terms.label')}
                  />
                </div>
                {fieldState.error?.message && (
                  <FormErrorMessage>
                    {fieldState.error?.message}
                  </FormErrorMessage>
                )}
              </div>
            )}
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="ui-font-semibold ui-text-gray-800">
          {t('field.comment.label')}
        </div>
        <TextArea
          placeholder={`${t('field.comment.placeholder')}...`}
          value={form.watch('comment') as string}
          onChange={(e) => form.setValue('comment', e.target.value)}
          className="ui-w-full ui-h-32"
        />
      </div>
    </div>
  )
}

export default TicketingSystemCreateTicketingTable
