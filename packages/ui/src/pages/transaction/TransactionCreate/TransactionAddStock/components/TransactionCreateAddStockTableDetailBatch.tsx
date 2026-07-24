import React, { useState } from 'react'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import { FormControl, FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { InputNumberV2 } from '#components/input-number-v2'
import { ReactSelectAsync } from '#components/react-select'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { STATUS } from '#constants/common'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStatusVVM } from '../../../transaction.services'
import { useTransactionCreateAddStockBatch } from '../hooks/useTransactionCreateAddStockBatch'
import {
  CreateTransactionBatch,
  NewBatchForm,
  TableBatchDetail,
  TransactionAddStockChild,
} from '../transaction-add-stock.type'
import TransactionCreateAddStockBudgetSourceModal from './TransactionCreateAddStockBudgetSourceModal'
import TransactionCreateAddStockModalAddBatch from './TransactionCreateAddStockModalAddBatch'
import TransactionCreateAddStockSelectReason from './TransactionCreateAddStockSelectReason'

const currency = process.env.CURRENCY

const TransactionCreateAddStockTableDetailBatch = ({
  indexData,
  unit,
  isManageInBatch,
  pieces_per_unit,
  temperature_sensitive,
  activity,
  material_id,
}: TableBatchDetail) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreateAddStock')
  const {
    watch,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<TransactionAddStockChild>()
  const { batches } = watch()

  const [openModalNewBatch, setOpenModalNewBatch] = useState<boolean>(false)
  const [batchIndex, setBatchIndex] = useState<number | null>(null)
  const [currentBatch, setCurrentBatch] = useState<NewBatchForm | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [index, setIndex] = useState({ indexItems: indexData, indexBatch: 0 })
  const [selectedItem, setSelectedItem] = useState<
    CreateTransactionBatch | undefined
  >(undefined)
  const { addNewNonBatch, columns } = useTransactionCreateAddStockBatch()
  return (
    <>
      <Table withBorder key={indexData} hightlightOnHover rounded>
        <Thead className="ui-bg-slate-100 ui-text-sm">
          <Tr>
            {columns(isManageInBatch).map((item) => (
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
            ))}
          </Tr>
        </Thead>
        <Tbody className="ui-bg-white ui-text-sm ui-font-normal ui-text-sm">
          {batches?.map((item, index) => (
            <Tr
              key={`item-material-batch-${indexData}-${index}`}
              id={`item-material-batch-${indexData}-${index}`}
              className={!item.batch_id ? 'ui-bg-info-50' : ''}
            >
              <Td id="no">{index + 1}</Td>
              <Td id="batch_info">
                <Exists useIt={item.managed_in_batch !== STATUS.ACTIVE}>
                  -
                </Exists>
                <Exists useIt={item.managed_in_batch === STATUS.ACTIVE}>
                  <div className="ui-flex ui-flex-col ui-space-y-1">
                    <div className="ui-font-bold">{item.code}</div>
                    <div>
                      {t('table.column.production_date')}:{' '}
                      {parseDateTime(
                        item.production_date ?? '',
                        'DD MMM YYYY',
                        language
                      )}
                    </div>
                    <div>
                      {t('table.column.manufacturer')}:{' '}
                      {item.manufacturer?.label ?? '-'}
                    </div>
                    <div>
                      {t('table.column.expired_date')}:{' '}
                      {parseDateTime(
                        item.expired_date ?? '',
                        'DD MMM YYYY',
                        language
                      )}
                    </div>
                  </div>
                </Exists>
                <Exists
                  useIt={
                    !item.batch_id && item.managed_in_batch === STATUS.ACTIVE
                  }
                >
                  <Button
                    variant="subtle"
                    type="button"
                    className="!ui-p-0 ui-justify-start ui-text-sm"
                    onClick={() => {
                      setBatchIndex(index)
                      setOpenModalNewBatch(true)
                      setCurrentBatch({
                        expired_date: item.expired_date,
                        production_date: item.production_date,
                        manufacturer: item.manufacturer,
                        code: item.code,
                      })
                    }}
                  >
                    {t('table.column.edit')}
                  </Button>
                </Exists>
              </Td>
              <Td id="stock_info">
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div>
                    {t('table.column.stock_on_hand')}:{' '}
                    {numberFormatter(item.on_hand_stock ?? 0, language)}
                  </div>
                  <div>
                    {t('table.column.allocated')}:{' '}
                    {numberFormatter(item.allocated_qty ?? 0, language)}
                  </div>
                  <div>
                    {t('table.column.available_stock')}:{' '}
                    {numberFormatter(item.available_qty ?? 0, language)}
                  </div>
                </div>
              </Td>
              <Td id="activity_name">{item.activity_name}</Td>
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
                        placeholder={t('enter_qty')}
                        value={value ?? ''}
                        error={!!error?.message}
                        onValueChange={(values: any) => {
                          const { floatValue } = values
                          onChange(floatValue ?? null)
                          const budgetSourcePrice = item.budget_source_price
                          const calculated =
                            floatValue && budgetSourcePrice
                              ? Number(budgetSourcePrice) / Number(floatValue)
                              : undefined

                          setValue(
                            `batches.${index}.total_price_input`,
                            calculated
                          )
                          trigger([
                            `batches.${index}.transaction_reason`,
                            `batches.${index}.budget_source`,
                            `batches.${index}.code`,
                            `batches.${index}.status_material`,
                            `batches`,
                          ])
                        }}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
              </Td>
              <Td id="material_status">
                <Controller
                  key={`${indexData}-${index}`}
                  control={control}
                  name={`batches.${index}.status_material`}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <ReactSelectAsync
                        {...field}
                        value={value}
                        id={`select-transaction-material-status-${indexData}-${index}`}
                        loadOptions={loadStatusVVM}
                        debounceTimeout={300}
                        isClearable
                        placeholder={t('select_status')}
                        additional={{
                          page: 1,
                        }}
                        onChange={(option) => onChange(option)}
                        menuPosition="fixed"
                        menuPlacement="top"
                        error={!!error?.message}
                        disabled={!item.temperature_sensitive}
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
              </Td>
              <Td id="reason">
                <TransactionCreateAddStockSelectReason
                  index={indexData}
                  indexBatch={index}
                />
              </Td>

              <Td id="budget-info">
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div>
                    {t('table.column.unit')}: {unit ?? '-'}
                  </div>
                  <div>
                    {t('table.column.budget_source')}:{' '}
                    {item.budget_source?.label}
                  </div>
                  <div>
                    {t('table.column.budget_year')}:{' '}
                    {item.budget_source_year?.label}
                  </div>
                  <div>
                    {`${t('table.column.total_price')} (${currency})`}:{' '}
                    {numberFormatter(
                      item.budget_source_price ?? 0,
                      language,
                      'currency'
                    )}
                  </div>
                  <div>
                    {`${t('table.column.purchase_per_unit')} (${currency})`}:{' '}
                    {numberFormatter(
                      item.total_price_input ?? 0,
                      language,
                      'currency'
                    )}
                    /{unit}
                  </div>
                  <Button
                    variant="subtle"
                    type="button"
                    className="!ui-p-0 ui-justify-start ui-text-sm"
                    onClick={() => {
                      setIndex({
                        indexBatch: index,
                        indexItems: indexData,
                      })
                      setSelectedItem(item)
                      setIsOpen(true)
                    }}
                  >
                    {t('table.column.edit')}
                  </Button>
                </div>
                {errors?.batches?.[index]?.budget_source?.message ||
                errors?.batches?.[index]?.budget_source_year?.message ||
                errors?.batches?.[index]?.budget_source_price?.message ? (
                  <FormErrorMessage>
                    {t('error_message_complete_data')}
                  </FormErrorMessage>
                ) : null}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <div className="ui-w-full ui-flex ui-justify-between ui-mt-4">
        <div>
          <Exists useIt={isManageInBatch === STATUS.ACTIVE || false}>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setOpenModalNewBatch(true)
                setCurrentBatch(null)
                setBatchIndex(null)
              }}
            >
              <div className="ui-flex ui-space-x-2">
                <span>
                  <Plus />
                </span>
                <div className="ui-text-sm">{t('batch')}</div>
              </div>
            </Button>
          </Exists>
          <Exists
            useIt={isManageInBatch === STATUS.INACTIVE && batches?.length === 0}
          >
            <Button
              variant="outline"
              type="button"
              onClick={() =>
                setValue(
                  `batches`,
                  addNewNonBatch({
                    batches,
                    temperature_sensitive,
                    pieces_per_unit,
                    activity,
                    managed_in_batch: isManageInBatch,
                  })
                )
              }
            >
              <div className="ui-flex ui-space-x-2">
                <span>
                  <Plus />
                </span>
                <div className="ui-text-sm">Detail</div>
              </div>
            </Button>
          </Exists>
        </div>
      </div>
      <TransactionCreateAddStockModalAddBatch
        isOpen={openModalNewBatch}
        setIsOpen={setOpenModalNewBatch}
        itemIndex={indexData}
        batchIndex={batchIndex}
        currentItem={currentBatch}
        setValueBatch={setValue}
        batches={batches}
        activity={activity}
        temperature_sensitive={temperature_sensitive}
        pieces_per_unit={pieces_per_unit}
        managed_in_batch={isManageInBatch}
        material_id={material_id}
      />
      <TransactionCreateAddStockBudgetSourceModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        index={index}
        item={selectedItem}
        unit={unit ?? ''}
        setValueBatch={setValue}
        triggerParent={trigger}
      />
    </>
  )
}

export default TransactionCreateAddStockTableDetailBatch
