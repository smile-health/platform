import React from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TransactionCreateTransferStockSchemaTable } from '../schema/TransactionCreateTransferStockSchemaTable'
import {
  CreateTransactionChild,
  CreateTransactionTransferStockItems,
} from '../transaction-transfer-stock.type'

const TransactionCraeteTransferStockTableDetail = ({
  indexData,
  items,
}: {
  indexData: number
  items: CreateTransactionTransferStockItems
}) => {
  const {
    watch,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTransactionChild>()
  const { batches } = watch()
  const { columnsBatch } = TransactionCreateTransferStockSchemaTable()
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')
  return (
    <Table withBorder key={indexData} hightlightOnHover rounded>
      <Thead className="ui-bg-slate-100 ui-text-sm">
        <Tr>
          {columnsBatch(batches?.some((i) => i.managed_in_batch === 1)).map(
            (item) => (
              <Th
                key={`header-${item.id}`}
                id={`header-${item.id}`}
                columnKey={item.id}
                className="ui-text-sm ui-text-dark-blue ui-font-bold"
                style={{
                  ...(item.size && { maxWidth: item.size }),
                }}
              >
                {item.header}
              </Th>
            )
          )}
        </Tr>
      </Thead>
      <Tbody className="ui-bg-white ui-text-sm ui-font-normal ui-text-sm">
        {batches?.map((item, index) => (
          <Tr
            key={`item-material-batch-${index.toString()}`}
            className={!item.batch_id ? 'ui-bg-info-50' : ''}
          >
            <Td id="si-no">{index + 1}</Td>
            <Td id="batch_info">
              <div className="ui-flex ui-flex-col ui-space-y-1">
                <div className="ui-font-bold">{item.code}</div>
                <div>
                  {t('transaction_transfer_stock.table_batch.production_date')}:{' '}
                  {parseDateTime(
                    item?.production_date || '',
                    'DD MMM YYYY',
                    language
                  )}
                </div>
                <div>
                  {t('transaction_transfer_stock.table_batch.manufacturer')}:{' '}
                  {item.manufacturer?.label || '-'}
                </div>
                <div>
                  {t('transaction_transfer_stock.table_batch.expired_date')}:{' '}
                  {parseDateTime(
                    item.expired_date || '',
                    'DD MMM YYYY',
                    language
                  )}
                </div>
              </div>
            </Td>
            <Td id="activity">{item.activity_name}</Td>
            <Td id="available_stock">
              {numberFormatter(item.available_qty, language)}
            </Td>
            <Td id="budget_info">
              <div className="ui-flex ui-flex-col ui-space-y-1">
                <div className="ui-font-bold">
                  {t('transaction_transfer_stock.table_batch.budget_source')}:{' '}
                  {item.budget_source?.label ? item.budget_source?.label : '-'}
                </div>
                <div>
                  {t('transaction_transfer_stock.table_batch.price')}:{' '}
                  {item.budget_source_price
                    ? numberFormatter(item.budget_source_price, language)
                    : '-'}
                </div>
                <div>
                  {t('transaction_transfer_stock.table_batch.total_price')}:{' '}
                  {item.budget_source_total_price
                    ? numberFormatter(item.budget_source_total_price, language)
                    : '-'}
                </div>
              </div>
            </Td>
            <Td id="quantity">
              <Controller
                key={`${indexData}-${index}`}
                control={control}
                name={`batches.${index}.change_qty`}
                render={({
                  field: { value, onChange, ...field },
                  fieldState: { error },
                }) => (
                  <FormControl>
                    <InputNumberV2
                      {...field}
                      id={`change-qty-material-stock-batch-${indexData}-${index}`}
                      placeholder={t('transaction_transfer_stock.enter_qty')}
                      value={value ?? ''}
                      error={!!error?.message}
                      onValueChange={(values: any) => {
                        const { floatValue } = values
                        onChange(floatValue ?? null)
                      }}
                    />
                    {error?.message && (
                      <FormErrorMessage>{error?.message}</FormErrorMessage>
                    )}
                  </FormControl>
                )}
              />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  )
}

export default TransactionCraeteTransferStockTableDetail
