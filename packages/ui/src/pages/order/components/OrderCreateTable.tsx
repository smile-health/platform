import React, { ReactNode } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStocks } from '../OrderCreate/order-create.service'

export type OrderCreateTableProps<T> = {
  headers: {
    header: string
    id: string
    size: number
  }[]
  onSubmit: () => void
  onReset: () => void
  onSelectDropdown: (option: OptionType) => void
  withDropdown?: boolean
  children?: ReactNode
  customer?: OptionType | null
  activity?: OptionType | null
  indexRow?: number | null
}

export const OrderCreateTable = <T extends { order_items?: any[] }>({
  headers,
  children,
  customer,
  activity,
  withDropdown = true,
  indexRow,
  onReset,
  onSubmit,
  onSelectDropdown,
}: OrderCreateTableProps<T>) => {
  const { t } = useTranslation(['orderCreate', 'common'])

  const {
    watch,
    formState: { errors },
  } = useFormContext<T>()

  const { order_items } = watch()

  return (
    <div className="ui-border ui-border-[#d2d2d2] ui-rounded ui-mt-6 ui-p-4">
      <div className="ui-font-bold ui-mb-4">{t('orderCreate:title.list')}</div>
      <Table
        overflowXAuto
        stickyOffset={0}
        withBorder
        rounded
        empty={!order_items || order_items?.length === 0}
        verticalAlignment="center"
      >
        <Thead>
          <Tr>
            {headers.map((header) => (
              <Th
                className="ui-px-2 ui-py-5 ui-text-left ui-text-sm ui-text-gray-700 ui-border-b ui-border-gray-300 ui-font-semibold"
                key={header.id}
                style={{
                  width: header?.size !== 0 ? `${header?.size}px` : 'auto',
                }}
              >
                {header.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {children}
          {withDropdown && order_items && order_items?.length > 0 && (
            <Tr>
              <Td colSpan={6} className="ui-p-2">
                <ReactSelectAsync
                  loadOptions={loadStocks}
                  key={`material-select-${customer?.label}-${activity?.label}`}
                  onChange={(option: OptionType) => {
                    onSelectDropdown(option)
                  }}
                  additional={{
                    page: 1,
                    activity: activity,
                    entity_id: customer?.value,
                    indexRow: indexRow,
                  }}
                  value={null}
                  className="!ui-w-96"
                  placeholder={t(
                    'orderCreate:list.selected.column.add_material'
                  )}
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                  error={!!errors?.order_items?.message}
                />
                {errors?.order_items && (
                  <div className="ui-mt-2">
                    <FormErrorMessage>
                      {errors?.order_items?.message as string}
                    </FormErrorMessage>
                  </div>
                )}
              </Td>
            </Tr>
          )}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t('common:message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>

      {/* Buttons  */}
      <div className="ui-flex ui-flex-row-reverse ui-mt-8">
        <Button color="primary" onClick={() => onSubmit()} className="ui-w-40">
          {t('orderCreate:button.send')}
        </Button>
        <Button
          color="primary"
          variant="outline"
          onClick={() => onReset()}
          className="ui-mr-4 ui-w-40"
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
