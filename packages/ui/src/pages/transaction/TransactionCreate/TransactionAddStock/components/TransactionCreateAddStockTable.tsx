import React, { useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { Exists } from '#components/exists'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { getBackgroundStock, numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import TransactionCreateMaterialDropdown from '../../components/TransactionCreateMaterialDropdown'
import { useModalWarningRemoveMaterialStore } from '../../store/modal-warning.store'
import { useTransactionCreateAddStock } from '../hooks/useTransactionCreateAddStock'
import useTransactionCreateAddStockTable from '../hooks/useTransactionCreateAddStockTable'
import {
  CreateTransactionAddStock,
  CreateTransactionAddStockItems,
} from '../transaction-add-stock.type'
import { checkIsHaveQty, SummaryListBatch } from '../utils/helpers'
import TransactionCreateAddStockTableDetail from './TransactionCreateAddStockTableDetail'

export const TransactionCreateAddStockTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['transactionCreateAddStock', 'common'])
  const {
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useFormContext<CreateTransactionAddStock>()
  const { activity, items } = watch()
  const { columns } = useTransactionCreateAddStockTable()
  const { handleDeleteItemAddStock, handleAddItemAddStock } =
    useTransactionCreateAddStock()
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false)
  const [indexRow, setIndexRow] = useState<number>(0)
  const [selectedItem, setSelectedItem] =
    useState<CreateTransactionAddStockItems | null>(null)
  const { setModalRemove, setCustomFunction } =
    useModalWarningRemoveMaterialStore()

  return (
    <div className="ui-mt-5">
      <Table
        withBorder
        rounded
        hightlightOnHover
        overflowXAuto
        stickyOffset={0}
        empty={!items || items?.length === 0}
      >
        <Thead className="ui-bg-slate-100 ui-text-sm">
          <Tr>
            {columns.map((item) => (
              <Th
                key={`header-${item.id}`}
                id={`header-${item.id}`}
                columnKey={item.id}
                className="ui-text-sm ui-text-dark-blue ui-font-bold"
                style={{
                  ...(item.size && { width: item.size }),
                }}
              >
                {item.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody className="ui-bg-white ui-text-sm">
          {(items as CreateTransactionAddStock['items'])?.map((item, index) => (
            <Tr
              className="ui-text-sm ui-font-normal"
              key={`item-material-${index.toString()}`}
            >
              <Td id={`cell-${columns[0].id}`}>{index + 1}</Td>
              <Td id={`cell-${columns[1].id}`}>
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div className="ui-font-bold">{item.material_name}</div>
                  <div>
                    {t('transactionCreateAddStock:table.column.activity')}:{' '}
                    {activity?.label}
                  </div>
                </div>
              </Td>
              <Td
                id={`cell-${columns[2].id}`}
                className={`ui-flex-row ${getBackgroundStock(item.on_hand_stock ?? 0, item.min ?? 0, item.max ?? 0)}`}
              >
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div>
                    {t('transactionCreateAddStock:table.column.stock_on_hand')}:{' '}
                    {numberFormatter(item.on_hand_stock ?? 0, language)}
                  </div>
                  <div>
                    {t(
                      'transactionCreateAddStock:table.column.available_stock'
                    )}
                    : {numberFormatter(item.available_stock ?? 0, language)}
                  </div>
                  <div>
                    <div className="ui-text-gray-500">
                      min: {numberFormatter(item?.min, language)}, {t('max')} :{' '}
                      {numberFormatter(item?.max, language)}
                    </div>
                  </div>
                </div>
              </Td>
              <Td id={`cell-${columns[3].id}`}>
                <Exists useIt={checkIsHaveQty(item?.batches)}>
                  <div className="ui-flex ui-flex-col ui-space-y-5 ui-mb-5">
                    {item?.batches?.map((itemBatch, indexBatch) => (
                      <Exists
                        useIt={!!itemBatch?.change_qty}
                        key={`${index.toString()}-${indexBatch.toString()}`}
                      >
                        <SummaryListBatch
                          key={`${index.toString()}-${indexBatch.toString()}`}
                          t={t}
                          lang={language}
                          batchName={itemBatch.code ?? ''}
                          expiredDate={itemBatch.expired_date ?? ''}
                          reason={itemBatch.transaction_reason?.label ?? ''}
                          budgetSource={itemBatch.budget_source?.label ?? ''}
                          qty={itemBatch.change_qty}
                          otherReason={itemBatch?.other_reason ?? ''}
                        />
                      </Exists>
                    ))}
                  </div>
                </Exists>

                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsOpenDrawer(true)
                    setIndexRow(index)
                    setSelectedItem(item)
                  }}
                  id={`see-detail-material-add-stock-${index.toString()}`}
                  className="ui-w-28"
                >
                  <div className="ui-flex ui-space-x-2">
                    <span>
                      <Plus />
                    </span>
                    <div className="ui-text-sm">
                      {item.managed_in_batch ? t('batch') : 'Detail'}
                    </div>
                  </div>
                </Button>
                {errors?.items?.[index]?.batches && (
                  <FormErrorMessage>
                    {errors?.items?.[index]?.batches?.message}
                  </FormErrorMessage>
                )}
              </Td>
              <Td id={`cell-${columns[4].id}`}>
                <Button
                  variant="subtle"
                  type="button"
                  color="danger"
                  id={`delete-material-add-stock-${index.toString()}`}
                  onClick={() => {
                    setModalRemove(true, index) // Open modal
                    setCustomFunction((param: number) =>
                      handleDeleteItemAddStock(param)
                    ) // Set the function remove material
                  }}
                >
                  {t('delete')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t('common:message.empty.description')}
            withIcon
          />
        </TableEmpty>
      </Table>
      {items?.length > 0 && (
        <TransactionCreateMaterialDropdown
          colSpan={columns.length}
          onSelect={(stock) => handleAddItemAddStock({ item: stock })}
          className="ui-w-[294px] ui-font-normal"
        />
      )}
      <TransactionCreateAddStockTableDetail
        handleClose={setIsOpenDrawer}
        isOpen={isOpenDrawer}
        idRow={indexRow}
        item={selectedItem}
        setValueParent={setValue}
        triggerParent={trigger}
        activity={activity ?? null}
        setItem={setSelectedItem}
      />
    </div>
  )
}
