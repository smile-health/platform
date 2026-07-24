import React from 'react'
import { EmptyState } from '#components/empty-state'
import { FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { UseFieldArrayAppend, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStockEntites } from '../../order-create.service'
import { MappedMaterialData, TOrderCreateForm } from '../../order-create.type'
import { mapStock } from '../../utils'
import OrderCreateHierarchyBatchDrawer from '../OrderCreateHierarchyDrawer'
import { OrderCreateHierarchyRow } from './OrderCreateHierarchyRow'
import { OrderCreateRow } from './OrderCreateRow'

type CommonOrderCreateTableProps = {
  onRemove: (index: number) => void
  append: UseFieldArrayAppend<TOrderCreateForm, 'order_items'>
  onHandleInputChange: (
    value: string | number,
    index: number,
    field: 'ordered_qty' | 'order_reason_id' | 'other_reason'
  ) => void
  headers: {
    header: string
    id: string
    size: number
  }[]
}

export type OrderCreateTableProps =
  | ({ isHierarchy: false } & CommonOrderCreateTableProps)
  | ({ isHierarchy: true } & {
      showDrawer: (index: number) => void
      setOpenDrawer: (flag: boolean) => void
      indexRow: number
      openDrawer: boolean
    } & CommonOrderCreateTableProps)

export const OrderCreateTable: React.FC<OrderCreateTableProps> = (props) => {
  const { headers, onRemove, onHandleInputChange, append, isHierarchy } = props
  const { t } = useTranslation(['orderCreate', 'common'])

  const {
    watch,
    formState: { errors },
    trigger,
  } = useFormContext<TOrderCreateForm>()

  const { activity_id, customer_id, order_items } = watch()

  const orderItemsMaterialId = order_items?.map(
    (item: MappedMaterialData) => item?.value?.material_id as number
  )

  return (
    <Table
      overflowXAuto
      stickyOffset={0}
      hightlightOnHover
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
        {order_items?.map((item, index) =>
          !isHierarchy ? (
            <OrderCreateRow
              key={`item-${item.value.material_id}`}
              index={index}
              item={item}
              onRemove={onRemove}
              onHandleInputChange={onHandleInputChange}
            />
          ) : (
            <>
              <OrderCreateHierarchyRow
                item={item}
                index={index}
                onOpenDrawer={(index) => props.showDrawer(index)}
                onRemove={onRemove}
                onHandleInputChange={onHandleInputChange}
              />
              <OrderCreateHierarchyBatchDrawer
                onClose={async () => {
                  props.setOpenDrawer(false)
                  trigger(`order_items.${props.indexRow}.value.children`)
                }}
                order_items={order_items}
                isOpen={props.indexRow === index && props.openDrawer}
                indexRow={props.indexRow}
              />
            </>
          )
        )}
        {order_items?.length > 0 && (
          <Tr>
            <Td colSpan={6} className="ui-p-2">
              <ReactSelectAsync
                loadOptions={loadStockEntites}
                key={order_items?.length}
                onChange={(option: OptionType) => {
                  append(option)
                }}
                additional={{
                  page: 1,
                  paginate: 10,
                  activity_id: activity_id?.value,
                  entity_id: customer_id?.value,
                  material_ids: orderItemsMaterialId,
                  is_hierarchy: 1,
                  ...(isHierarchy && {
                    material_level_id: '2',
                  }),
                }}
                value={null}
                className="!ui-w-96"
                placeholder={t('orderCreate:list.selected.column.add_material')}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
                }}
                error={!!errors?.order_items?.message}
              />
              {errors?.order_items && (
                <div className="ui-mt-2">
                  <FormErrorMessage>
                    {errors?.order_items?.message}
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
  )
}
