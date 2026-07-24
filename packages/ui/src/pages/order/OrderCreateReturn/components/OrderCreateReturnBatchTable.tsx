import React, { Dispatch, SetStateAction } from 'react'
import { EmptyState } from '#components/empty-state'
import { OptionType } from '#components/react-select'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItem } from '../order-create-return.type'
import { OrderCreateReturnBatchInformation } from './OrderCreateReturnBatchInformation'
import { OrderCreateReturnBatchInputStock } from './OrderCreateReturnBatchInputStock'
import { OrderCreateReturnBatchSelectStatus } from './OrderCreateReturnBatchSelectStatus'
import { OrderCreateReturnBatchStockInformation } from './OrderCreateReturnBatchStockInformation'

export type OrderCreateReturnBatchTableProps = {
  headers: { header: string; id: string; size: number }[]
  indexRow: number
  resetKey: number
  setActiveField: Dispatch<SetStateAction<string | null>>
  onHandleInputChange: (
    value: number | OptionType | null,
    indexBatch: number,
    field: 'batch_ordered_qty' | 'batch_order_stock_status_id',
    tableName: 'valid' | 'expired'
  ) => void
}

export const OrderCreateReturnBatchTable = ({
  headers,
  indexRow,
  resetKey,
  setActiveField,
  onHandleInputChange,
}: OrderCreateReturnBatchTableProps) => {
  const { t } = useTranslation(['common', 'orderCreateReturn'])
  const { control, watch, trigger } = useFormContext<OrderItem>()
  const { material_stocks } = watch()
  const validMaterials = material_stocks?.valid
  const expiredMaterials = material_stocks?.expired
  const allMaterialStocks = [...validMaterials, ...expiredMaterials]
  const totalCols = headers.length

  return (
    <Table
      withBorder
      rounded
      hightlightOnHover
      key={`drawer-material-${indexRow}`}
      empty={!allMaterialStocks?.length}
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
        {validMaterials?.length > 0 && (
          <>
            <Tr>
              <Td
                colSpan={totalCols}
                className="ui-font-semibold ui-text-xs ui-bg-[#E2E8F0]"
              >
                {t('orderCreateReturn:drawer.table.valid_material')}
              </Td>
            </Tr>
            {validMaterials.map((stock, index) => (
              <Tr
                key={`valid-${stock?.batch_code}-${indexRow}-${index}`}
                className="ui-text-sm ui-text-dark-blue ui-font-normal ui-leading-6"
              >
                <Td>{index + 1}</Td>
                <OrderCreateReturnBatchInformation
                  headers={headers}
                  material_stock={stock}
                />
                <OrderCreateReturnBatchStockInformation
                  headers={headers}
                  material_stock={stock}
                />
                <Td>{stock?.batch_activity?.name ?? '-'}</Td>
                <OrderCreateReturnBatchInputStock
                  headers={headers}
                  indexRow={indexRow}
                  index={index}
                  resetKey={resetKey}
                  control={control}
                  material_stocks={validMaterials}
                  setActiveField={setActiveField}
                  onHandleInputChange={onHandleInputChange}
                  trigger={trigger}
                  tableName="valid"
                />
                <OrderCreateReturnBatchSelectStatus
                  headers={headers}
                  indexRow={indexRow}
                  index={index}
                  control={control}
                  material_stocks={validMaterials}
                  onHandleInputChange={onHandleInputChange}
                  trigger={trigger}
                  tableName="valid"
                />
              </Tr>
            ))}
          </>
        )}

        {expiredMaterials?.length > 0 && (
          <>
            <Tr>
              <Td
                colSpan={totalCols}
                className="ui-font-semibold ui-text-xs ui-bg-[#E2E8F0]"
              >
                {t('orderCreateReturn:drawer.table.expired_material')}
              </Td>
            </Tr>
            {expiredMaterials.map((stock, index) => (
              <Tr
                key={`expired-${stock?.batch_code}-${indexRow}-${index}`}
                className="ui-text-sm ui-text-dark-blue ui-font-normal ui-leading-6"
              >
                <Td>{index + 1}</Td>
                <OrderCreateReturnBatchInformation
                  headers={headers}
                  material_stock={stock}
                />
                <OrderCreateReturnBatchStockInformation
                  headers={headers}
                  material_stock={stock}
                />
                <Td>{stock?.batch_activity?.name ?? '-'}</Td>
                <OrderCreateReturnBatchInputStock
                  headers={headers}
                  indexRow={indexRow}
                  index={index}
                  resetKey={resetKey}
                  control={control}
                  material_stocks={expiredMaterials}
                  setActiveField={setActiveField}
                  onHandleInputChange={onHandleInputChange}
                  trigger={trigger}
                  tableName="expired"
                />
                <OrderCreateReturnBatchSelectStatus
                  headers={headers}
                  indexRow={indexRow}
                  index={index}
                  control={control}
                  material_stocks={expiredMaterials}
                  onHandleInputChange={onHandleInputChange}
                  trigger={trigger}
                  tableName="expired"
                />
              </Tr>
            ))}
          </>
        )}
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
