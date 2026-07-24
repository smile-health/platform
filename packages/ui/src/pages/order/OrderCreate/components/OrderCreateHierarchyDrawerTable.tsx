import React from 'react'
import { EmptyState } from '#components/empty-state'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MappedMaterialData, MaterialChildren } from '../order-create.type'

export type OrderCreateHierarchyDrawerTableProps = {
  headers: {
    header: string
    id: string
    size: number
  }[]
  indexRow: number
  resetKey: number
  onHandleInputChange: (
    value: number | null,
    indexBatch: number,
    field: 'ordered_qty'
  ) => void
}

export const OrderCreateHierarchyDrawerTable = ({
  headers,
  indexRow,
  resetKey,
  onHandleInputChange,
}: OrderCreateHierarchyDrawerTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreateReturn'])
  const { control, watch, trigger } =
    useFormContext<MappedMaterialData['value']>()

  const { children } = watch()

  return (
    <Table
      withBorder
      rounded
      hightlightOnHover
      key={`drawer-material-${indexRow}`}
      empty={!children?.length}
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
        {children?.map((stock: MaterialChildren, index: number) => {
          return (
            <Tr
              id={`row-material-${index}-${indexRow}-batch-${stock?.material_id}`}
              key={`material-${stock?.material_id}-${indexRow}-${index}`}
              className="ui-text-sm ui-text-dark-blue ui-font-normal ui-leading-6"
            >
              <Td id={`cell-${headers?.[0]?.id}`}>{index + 1}</Td>
              <Td id={`cell-${headers?.[1]?.id}`}>
                <div className="ui-text-dark-blue">
                  <strong>{stock?.name ?? '-'}</strong>
                </div>
              </Td>

              <Td
                id={`cell-${headers?.[2]?.id}`}
                className={`ui-flex-row ui-align-top ${getBackgroundStock(stock?.available_qty ?? 0, stock?.min ?? 0, stock?.max ?? 0)}`}
              >
                <div className="ui-flex ui-flex-col ui-text-dark-blue ui-text-sm">
                  <p id={`cell-${headers?.[2]?.id}-on_hand_stock`}>
                    {numberFormatter(stock?.available_qty ?? 0, language)}
                  </p>
                  <p
                    className="ui-text-[#737373] ui-text-sm"
                    id={`cell-${headers?.[2]?.id}-min_max`}
                  >{`(min: ${numberFormatter(stock?.min ?? 0, language)}, max: ${numberFormatter(stock?.max ?? 0, language)})`}</p>
                </div>
              </Td>
              <Td id={`cell-${headers?.[4]?.id}`}>
                <Controller
                  control={control}
                  key={`ordered_qty_${indexRow}-${index}-${resetKey}`}
                  name={`children.${index}.ordered_qty`}
                  render={({ fieldState: { error }, field: { value } }) => {
                    return (
                      <FormControl>
                        <InputNumberV2
                          id={`input-quantity-${indexRow}-${index}`}
                          placeholder={t(
                            'orderCreateReturn:drawer.table.column.quantity.placeholder'
                          )}
                          defaultValue={
                            children?.[index]?.ordered_qty || undefined
                          }
                          onValueChange={(e) => {
                            onHandleInputChange(
                              e.floatValue as number,
                              index,
                              'ordered_qty'
                            )
                            trigger(`children.${index}.ordered_qty`)
                          }}
                          error={!!error?.message}
                        />
                        {error?.message && (
                          <FormErrorMessage>{error?.message}</FormErrorMessage>
                        )}
                      </FormControl>
                    )
                  }}
                />
              </Td>
            </Tr>
          )
        })}
      </Tbody>
      <TableEmpty>
        <EmptyState
          title={t('common:message.empty.title')}
          description={t('orderCreateReturn:drawer.table.empty')}
          withIcon
        />
      </TableEmpty>
    </Table>
  )
}
