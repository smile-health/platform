import React, { ReactNode } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { OptionType } from '#components/react-select'
import { Table, TableEmpty, Tbody, Th, Thead, Tr } from '#components/table'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItem, TOrderCreateReturnForm } from '../order-create-return.type'
import { OrderCreateReturnTableDropdownMaterial } from './OrderCreateReturnTableDropdownMaterial'

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
  activity: OptionType | null
  indexRow?: number | null
}

export const OrderCreateTable = <T extends { order_items?: any[] }>({
  headers,
  children,
  customer,
  activity,
  withDropdown = true,
  onReset,
  onSubmit,
  onSelectDropdown,
}: OrderCreateTableProps<T>) => {
  const { t } = useTranslation(['orderCreate', 'common'])

  const {
    watch,
    formState: { errors },
  } = useFormContext<TOrderCreateReturnForm>()

  const { order_items } = watch()

  const orderItemsMaterialId = order_items?.map(
    (item: OrderItem) => item.material_id as number
  )

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
              <OrderCreateReturnTableDropdownMaterial
                order_items={order_items}
                customer={customer}
                activity={activity}
                orderItemsMaterialId={orderItemsMaterialId}
                onSelectDropdown={onSelectDropdown}
                errors={errors}
              />
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
        <Button
          color="primary"
          onClick={() => onSubmit()}
          disabled={!order_items?.length}
          className="ui-w-40"
        >
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
