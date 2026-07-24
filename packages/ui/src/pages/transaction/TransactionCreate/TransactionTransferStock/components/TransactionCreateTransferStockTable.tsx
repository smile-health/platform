import React, { useState } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { Exists } from '#components/exists'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningRemoveMaterialStore } from '../../store/modal-warning.store'
import useTransactionCreateTransferStock from '../hooks/useTransactionCreateTransferStock'
import { TransactionCreateTransferStockSchemaTable } from '../schema/TransactionCreateTransferStockSchemaTable'
import { useOpenDrawerStore } from '../store/transfer-stock-detail.store'
import { CreateTransactionTransferStock } from '../transaction-transfer-stock.type'
import TransactionCreateTransferStockActivity from './TransactionCreateTransferStockActivity'
import TransactionCreateTransferStockDetail from './TransactionCreateTransferStockDetail'

const TransactionCreateTransferStockTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['transactionCreate', 'common'])
  const {
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useFormContext<CreateTransactionTransferStock>()
  const { items } = watch()
  const [indexRow, setIndexRow] = useState<number>(0)
  const { setModalRemove, setCustomFunction } =
    useModalWarningRemoveMaterialStore()
  const { columns } = TransactionCreateTransferStockSchemaTable()
  const { checkIsHaveQty, handleDeleteItemTransferStock } =
    useTransactionCreateTransferStock()
  const { setIsOpenDrawer, isOpenDrawer } = useOpenDrawerStore()
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
          {items?.map((item, index) => (
            <Tr
              className="ui-text-sm ui-font-normal"
              key={`item-material-${index.toString()}`}
            >
              <Td id={`cell-${columns[0].id}`}>{index + 1}</Td>
              <Td id={`cell-${columns[1].id}`}>
                <div className="ui-font-bold">{item.material_name}</div>
              </Td>
              <Td id={`cell-${columns[2].id}`}>
                {numberFormatter(item.available_stock, language)}
              </Td>
              <Td id={`cell-${columns[3].id}`}>
                <Exists useIt={checkIsHaveQty(item?.batches)}>
                  <div className="ui-flex ui-flex-col ui-space-y-5 ui-mb-5">
                    {item?.batches?.map((itemBatch, indexBatch) => (
                      <Exists useIt={!!itemBatch?.change_qty}>
                        <div
                          className="ui-flex ui-flex-col ui-space-y-1"
                          key={`preview-batches-${indexBatch.toString()}`}
                        >
                          <div>
                            {t('transaction_transfer_stock.batch_code')}:{' '}
                            {itemBatch?.code ? itemBatch?.code : '-'}
                          </div>
                          <div>
                            {t(
                              'transaction_transfer_stock.table_batch.expired_date'
                            )}
                            :{' '}
                            {itemBatch?.expired_date
                              ? parseDateTime(
                                  itemBatch?.expired_date || '',
                                  'DD MMM YYYY',
                                  language
                                )
                              : '-'}
                          </div>
                          <div>
                            {t(
                              'transaction_transfer_stock.stock_from_activity'
                            )}
                            :{' '}
                            {itemBatch?.activity_name
                              ? itemBatch?.activity_name
                              : '-'}
                          </div>
                          <div className="ui-font-bold">
                            Qty:{' '}
                            {itemBatch?.change_qty
                              ? numberFormatter(itemBatch?.change_qty, language)
                              : '-'}
                          </div>
                        </div>
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
                  }}
                  id={`see-detail-material-add-stock-${index}`}
                  className="ui-w-28"
                >
                  <div className="ui-flex ui-space-x-2">
                    <span>
                      <Plus />
                    </span>
                    <div className="ui-text-sm">
                      {item.managed_in_batch ? 'Batch' : 'Detail'}
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
                <TransactionCreateTransferStockActivity
                  index={index}
                  material_id={item?.material_id}
                />
              </Td>
              <Td id={`cell-${columns[5].id}`}>
                <Button
                  variant="subtle"
                  type="button"
                  color="danger"
                  id={`delete-material-add-stock-${index}`}
                  onClick={() => {
                    setModalRemove(true, index)
                    setCustomFunction((param: number) =>
                      handleDeleteItemTransferStock(param)
                    )
                  }}
                >
                  {t('common:delete')}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
        <TableEmpty>
          <EmptyState
            title={t('common:message.empty.title')}
            description={t(
              'transactionCreate:transaction_transfer_stock.empty_transaction_table'
            )}
            withIcon
          />
        </TableEmpty>
      </Table>
      <TransactionCreateTransferStockDetail
        handleClose={setIsOpenDrawer}
        isOpen={isOpenDrawer}
        idRow={indexRow}
        items={items}
        setValueParent={setValue}
        triggerParent={trigger}
        errorsParent={errors}
      />
    </div>
  )
}

export default TransactionCreateTransferStockTable
