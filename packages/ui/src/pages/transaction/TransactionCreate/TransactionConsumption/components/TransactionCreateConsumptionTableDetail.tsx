import React from 'react'
import { Exists } from '#components/exists'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { ReactSelectAsync } from '#components/react-select'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStatusVVM } from '../../TransactionAddStock/transaction-add-stock.service'
import { TransactionCreateConsumptionBatch } from '../hooks/useTransactionCreateConsumptionBatch'
import {
  CreateTransactionChild,
  CreateTransactionConsumptionItems,
} from '../transaction-consumption.type'
import TransactionCreateConsumptionOtherActivity from './TransactionCreateConsumptionOtherActivity'
import TransactionCreateConsumptionPatientIdentity from './TransactionCreateConsumptionPatientIdentity'
import TransactionCreateConsumptionTableDetailCloseVialSupportingText from './TransactionCreateConsumptionTableDetailCloseVialSupportingText'

const TransactionCreateConsumptionTableDetail = ({
  indexData,
  items,
}: {
  indexData: number
  items: CreateTransactionConsumptionItems
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreateConsumption')
  const { columns } = TransactionCreateConsumptionBatch()
  const {
    watch,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<CreateTransactionChild>()
  const { batches, all_patient_id } = watch()
  return (
    <>
      <Table withBorder key={indexData} hightlightOnHover rounded>
        <Thead className="ui-bg-slate-100 ui-text-sm">
          <Tr>
            {columns(
              batches?.some((i) => i.managed_in_batch === 1),
              Boolean(items?.is_vaccine),
              Boolean(items?.is_need_sequence),
              Boolean(items?.is_open_vial)
            ).map((item) => (
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
        <Tbody className="ui-bg-white  ui-font-normal ui-text-sm">
          {batches?.map((item, index) => (
            <Tr
              key={`item-material-batch-${index.toString()}`}
              className={!item.batch_id ? 'ui-bg-info-50' : ''}
            >
              <Td id="no">{index + 1}</Td>
              <Td id="batch_info">
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div className="ui-font-bold">{item.code}</div>
                  <div>
                    {t('table.column.production_date')}:{' '}
                    {parseDateTime(
                      item?.production_date || '',
                      'DD MMM YYYY',
                      language
                    )}
                  </div>
                  <div>
                    {t('table.column.manufacturer')}:{' '}
                    {item.manufacturer?.label || '-'}
                  </div>
                  <div>
                    {t('table.column.expired_date')}:{' '}
                    {parseDateTime(
                      item.expired_date || '',
                      'DD MMM YYYY',
                      language
                    )}
                  </div>
                </div>
              </Td>
              <Td id="stock_info">
                <div className="ui-flex ui-flex-col ui-space-y-1">
                  <div>
                    {t('table.column.stock_on_hand')}:{' '}
                    {numberFormatter(item.on_hand_stock || 0, language)}
                  </div>
                  <div>
                    {t('table.column.allocated')}:{' '}
                    {numberFormatter(item.allocated_qty || 0, language)}
                  </div>
                  <div>
                    {t('table.column.available_stock')}:{' '}
                    {item.is_open_vial ? (
                      <div>
                        {`${numberFormatter(item.open_vial_qty || 0, language)} (${t('open_vial').toLocaleLowerCase()}) ${numberFormatter(item.available_qty || 0, language)} (${t('close_vial').toLocaleLowerCase()})`}
                      </div>
                    ) : (
                      <>{numberFormatter(item.available_qty || 0, language)}</>
                    )}
                  </div>
                </div>
              </Td>
              <Td id="activity">{item.activity_name}</Td>
              <Exists useIt={!!items?.is_vaccine}>
                <Td id="patient_identity" className="ui-p-0">
                  <TransactionCreateConsumptionPatientIdentity
                    item={item}
                    setValueBatch={setValue}
                    indexItem={index}
                    isErrorBatch={!!errors?.batches?.[index]?.patients}
                    indexParent={indexData}
                    currentAllPatientId={all_patient_id}
                  />
                </Td>
              </Exists>
              <Exists useIt={!item?.is_open_vial}>
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

                            trigger([
                              `batches.${index}.status_material`,
                              'batches',
                            ])
                          }}
                          disabled={Boolean(
                            !item?.on_hand_stock ||
                              // condition for rabies need sequence
                              (items.is_vaccine &&
                                items.is_need_sequence &&
                                !item.patients?.[0]?.vaccination
                                  ?.vaccine_sequence?.value) ||
                              // condition for rabies non sequence
                              (items.is_vaccine &&
                                !items.is_need_sequence &&
                                !item.patients?.[0]?.vaccination?.patient_id)
                          )}
                        />
                        {error?.message && (
                          <FormErrorMessage>{error?.message}</FormErrorMessage>
                        )}
                      </FormControl>
                    )}
                  />
                </Td>
              </Exists>
              <Exists useIt={Boolean(item?.is_open_vial)}>
                <>
                  <Td id="open_vial" className="ui-w-96">
                    <Controller
                      key={`${indexData}-${index}`}
                      control={control}
                      name={`batches.${index}.open_vial`}
                      render={({
                        field: { value, onChange, ...field },
                        fieldState: { error },
                      }) => (
                        <FormControl>
                          <InputNumberV2
                            {...field}
                            id={`open-vial-material-stock-batch-${indexData}-${index}`}
                            placeholder={t('enter_qty')}
                            value={value ?? ''}
                            error={!!error?.message}
                            onValueChange={(values: any) => {
                              const { floatValue } = values
                              onChange(floatValue ?? null)
                              if (
                                Number(floatValue) <
                                  Number(item?.open_vial_qty) ||
                                !floatValue
                              ) {
                                setValue(`batches.${index}.close_vial`, null)
                              }
                              trigger([
                                `batches.${index}.status_material`,
                                'batches',
                              ])
                            }}
                            disabled={Number(item?.open_vial_qty) <= 0}
                          />
                          {error?.message && (
                            <FormErrorMessage>
                              {error?.message}
                            </FormErrorMessage>
                          )}
                        </FormControl>
                      )}
                    />
                  </Td>
                  <Td id="close_vial" className="ui-w-96">
                    <Controller
                      key={`${indexData}-${index}`}
                      control={control}
                      name={`batches.${index}.close_vial`}
                      render={({
                        field: { value, onChange, ...field },
                        fieldState: { error },
                      }) => (
                        <FormControl>
                          <InputNumberV2
                            {...field}
                            id={`close-vial-material-stock-batch-${indexData}-${index}`}
                            placeholder={t('enter_qty')}
                            disabled={
                              Number(watch(`batches.${index}.open_vial`)) <
                              Number(item?.open_vial_qty)
                            }
                            value={value ?? ''}
                            error={!!error?.message}
                            onValueChange={(values: any) => {
                              const { floatValue } = values
                              onChange(floatValue ?? null)
                              trigger([`batches.${index}.open_vial`])
                              trigger([
                                `batches.${index}.status_material`,
                                'batches',
                              ])
                            }}
                          />

                          {error?.message ? (
                            <FormErrorMessage>
                              {error?.message}
                            </FormErrorMessage>
                          ) : (
                            <TransactionCreateConsumptionTableDetailCloseVialSupportingText
                              item={item}
                              value={value}
                            />
                          )}
                        </FormControl>
                      )}
                    />
                  </Td>
                </>
              </Exists>
              <Td id="material_status" className="ui-w-auto">
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
            </Tr>
          ))}
        </Tbody>
      </Table>
      <TransactionCreateConsumptionOtherActivity
        items={items}
        setValue={setValue}
        batches={batches}
      />
    </>
  )
}

export default TransactionCreateConsumptionTableDetail
