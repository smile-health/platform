import React from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { BOOLEAN } from '#constants/common'
import { parseDateTime } from '#utils/date'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateReturnFromFacility } from '../hooks/useTransactionCreateReturnFromFacility'
import {
  textGrouper,
  thousandFormatter,
} from '../transaction-return-from-facility.common'
import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'
import { CreateTransactionReturnFromFacilityForm } from '../transaction-return-from-facility.type'
import TransactionReturnFromFacilityDetailDrawer from './TransactionReturnFromFacilityDetailDrawer'
import TransactionReturnFromFacilityDiscardFormDialog from './TransactionReturnFromFacilityDiscardFormDialog'
import TransactionReturnFromFacilityTitleBlock from './TransactionReturnFromFacilityTitleBlock'

const TransactionReturnFromFacilityItemTable = (): JSX.Element => {
  const { t, i18n } = useTranslation(['transactionCreate', 'common'])
  const locale = i18n.language
  const { handleDeleteTransaction } = useTransactionCreateReturnFromFacility(t)
  const { setDiscardStockData, setStockData } = React.useContext(
    TransactionReturnFromFacilityContext
  )
  const methods = useFormContext<CreateTransactionReturnFromFacilityForm>()
  const {
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = methods

  const fields = watch('items')

  return (
    <>
      <h3 className="ui-text-base ui-text-dark-teal ui-font-bold">
        {t('transactionCreate:transaction_return_from_facility.title_table')}
      </h3>
      <div className="ui-mt-6">
        <TransactionReturnFromFacilityDetailDrawer />
        <TransactionReturnFromFacilityDiscardFormDialog />
        <Table
          layout="fixed"
          empty={!fields || fields?.length <= 0}
          stickyOffset={0}
          overflowXAuto
          withBorder
        >
          <Thead>
            <Tr>
              <Th className="ui-w-12">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  SI.No
                </div>
              </Th>
              <Th className="ui-w-36">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  {t(
                    'transactionCreate:transaction_return_from_facility.input_table.column.material'
                  )}
                </div>
              </Th>
              <Th className="ui-w-36">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  {t('transactionCreate:table.column.activity')}
                </div>
              </Th>
              <Th className="ui-w-36">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  {t(
                    'transactionCreate:transaction_return_from_facility.input_table.detail_column.batch_info'
                  )}
                </div>
              </Th>
              <Th className="ui-w-48">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  {t(
                    'transactionCreate:transaction_return_from_facility.input_table.column.quantity_info'
                  )}
                </div>
              </Th>
              {fields?.some(
                (data) =>
                  data?.material?.is_open_vial === BOOLEAN.TRUE &&
                  data?.customer_is_open_vial
              ) ? (
                <>
                  <Th className="ui-w-36">
                    <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                      {t(
                        'transactionCreate:transaction_return_from_facility.input_table.column.open_vial'
                      )}
                    </div>
                  </Th>
                  <Th className="ui-w-36">
                    <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                      {t(
                        'transactionCreate:transaction_return_from_facility.input_table.column.close_vial'
                      )}
                    </div>
                  </Th>
                </>
              ) : (
                <Th className="ui-w-36">
                  <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                    {t(
                      'transactionCreate:transaction_return_from_facility.input_table.detail_column.return_amount'
                    )}
                  </div>
                </Th>
              )}
              <Th className="ui-w-36">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  {t(
                    'transactionCreate:transaction_return_from_facility.input_table.detail_column.is_anything_discarded'
                  )}
                </div>
              </Th>
              <Th className="ui-w-36">
                <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                  {t('common:action')}
                </div>
              </Th>
            </Tr>
          </Thead>
          <Tbody className="ui-bg-white ui-group ui-text-sm ui-font-normal">
            {fields?.map((data, index) => {
              const thousand = (
                value?: number,
                exceptionLabel: string | number = '-'
              ) =>
                value ? thousandFormatter({ value, locale }) : exceptionLabel
              const isProtocolTransaction = !!data.protocol?.id
              const isOpenVial =
                data?.material?.is_open_vial === BOOLEAN.TRUE &&
                data?.customer_is_open_vial
              const openVialQtyFilled =
                watch(
                  `items[${index}].return_qty` as keyof CreateTransactionReturnFromFacilityForm
                ) ||
                watch(
                  `items[${index}].open_vial_qty` as keyof CreateTransactionReturnFromFacilityForm
                )
              const cannotInputCloseVialQty =
                data.max_return <
                data.material.consumption_unit_per_distribution_unit

              const returnQty = isOpenVial
                ? openVialQtyFilled
                : watch(
                    `items[${index}].return_qty` as keyof CreateTransactionReturnFromFacilityForm
                  )
              const appearDiscardQty = isOpenVial
                ? data.discard_open_vial_qty || data?.discard_qty
                : data?.discard_qty
              const resetDiscardQty = () => {
                setValue(
                  `items[${index}].discard_qty` as keyof CreateTransactionReturnFromFacilityForm,
                  null
                )
                setValue(
                  `items[${index}].discard_open_vial_qty` as keyof CreateTransactionReturnFromFacilityForm,
                  null
                )
                setValue(
                  `items[${index}].discard_reason` as keyof CreateTransactionReturnFromFacilityForm,
                  null
                )
                setValue(
                  `items[${index}].other_reason` as keyof CreateTransactionReturnFromFacilityForm,
                  null
                )
              }

              return (
                <Tr
                  key={`transaction_return_from_facility_input_batch_table_${index?.toString()}`}
                >
                  <Td>{index + 1}</Td>
                  <Td>{data?.material?.name ?? '-'}</Td>
                  <Td>
                    <TransactionReturnFromFacilityTitleBlock
                      arrText={[
                        {
                          label: data?.activity?.name ?? '',
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-bold',
                        },
                        {
                          label: `${t(
                            'transactionCreate:transaction_return_from_facility.taken_from'
                          )}: ${data?.stock?.activity?.name ?? '-'}`,
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-normal',
                        },
                      ]}
                    />
                  </Td>
                  <Td>
                    <TransactionReturnFromFacilityTitleBlock
                      arrText={[
                        {
                          label: data?.stock?.batch?.code ?? '-',
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-bold',
                        },
                        {
                          label: `${t(
                            'transactionCreate:transaction_return_from_facility.input_table.detail_column.manufacturer'
                          )}: ${data?.stock?.batch?.manufacture?.name ?? '-'}`,
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-normal',
                        },
                        {
                          label: `${t(
                            'transactionCreate:transaction_return_from_facility.input_table.detail_column.expired_date'
                          )}: ${parseDateTime(data?.stock?.batch?.expired_date as string, 'DD MMM YYYY', locale)?.toUpperCase()}`,
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-normal',
                        },
                      ]}
                    />
                  </Td>
                  <Td>
                    <TransactionReturnFromFacilityTitleBlock
                      arrText={[
                        {
                          label: `${t('transactionCreate:transaction_return_from_facility.input_table.column.max_return_qty')}: ${thousand(
                            data?.max_return ?? 0
                          )}`,
                          className:
                            'ui-text-sm ui-font-bold ui-text-dark-teal',
                        },
                        {
                          label: `${t('transactionCreate:transaction_return_from_facility.input_table.column.max_consumption_qty')}: ${thousand(
                            Math.abs(data?.change_qty ?? 0)
                          )}`,
                          className:
                            'ui-text-sm ui-font-normal ui-text-dark-teal',
                        },
                      ]}
                    />
                  </Td>
                  {isOpenVial && (
                    <Td>
                      <InputNumberV2
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                          e.target.blur()
                        }}
                        placeholder={t(
                          'transactionCreate:transaction_return_from_facility.input_table.detail_column.placeholder.qty'
                        )}
                        value={data?.open_vial_qty ?? ''}
                        disabled={isProtocolTransaction}
                        onValueChange={(values) => {
                          setValue(
                            `items[${index}].open_vial_qty` as keyof CreateTransactionReturnFromFacilityForm,
                            values?.floatValue as number
                          )
                          resetDiscardQty()
                          trigger(
                            `items[${index}].open_vial_qty` as keyof CreateTransactionReturnFromFacilityForm
                          )
                          trigger(
                            `items[${index}].return_qty` as keyof CreateTransactionReturnFromFacilityForm
                          )
                        }}
                      />
                      <FormErrorMessage>
                        {errors?.items?.[index]?.open_vial_qty?.message}
                      </FormErrorMessage>
                    </Td>
                  )}
                  <Td>
                    <InputNumberV2
                      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                        e.target.blur()
                      }}
                      placeholder={t(
                        'transactionCreate:transaction_return_from_facility.input_table.detail_column.placeholder.qty'
                      )}
                      value={data?.return_qty ?? ''}
                      disabled={
                        isProtocolTransaction || cannotInputCloseVialQty
                      }
                      onValueChange={(values) => {
                        setValue(
                          `items[${index}].return_qty` as keyof CreateTransactionReturnFromFacilityForm,
                          values?.floatValue as number
                        )
                        resetDiscardQty()
                        trigger(
                          `items[${index}].return_qty` as keyof CreateTransactionReturnFromFacilityForm
                        )
                        trigger(
                          `items[${index}].open_vial_qty` as keyof CreateTransactionReturnFromFacilityForm
                        )
                      }}
                    />
                    <FormErrorMessage>
                      {errors?.items?.[index]?.return_qty?.message}
                    </FormErrorMessage>
                  </Td>
                  <Td>
                    {appearDiscardQty ? (
                      <div className="ui-flex ui-flex-col">
                        <TransactionReturnFromFacilityTitleBlock
                          arrText={[
                            ...(isOpenVial
                              ? [
                                  {
                                    label: textGrouper({
                                      text1: t(
                                        'transactionCreate:transaction_return_from_facility.input_table.column.open_vial'
                                      ),
                                      text2:
                                        thousand(
                                          data?.discard_open_vial_qty ?? 0
                                        )?.toString() ?? '-',
                                      separator: ': ',
                                    }),
                                    className:
                                      'ui-text-dark-teal ui-text-sm ui-font-normal',
                                  },
                                ]
                              : []),
                            {
                              label: textGrouper({
                                text1: isOpenVial
                                  ? t(
                                      'transactionCreate:transaction_return_from_facility.input_table.column.close_vial'
                                    )
                                  : t(
                                      'transactionCreate:transaction_return_from_facility.input_table.column.quantity'
                                    ),
                                text2:
                                  thousand(data?.discard_qty)?.toString() ??
                                  '-',
                                separator: ': ',
                              }),
                              className:
                                'ui-text-dark-teal ui-text-sm ui-font-normal',
                            },
                            {
                              label: textGrouper({
                                text1: t(
                                  'transactionCreate:transaction_return_from_facility.input_table.column.reason'
                                ),
                                text2:
                                  data?.other_reason ??
                                  data?.discard_reason?.label,
                                separator: ': ',
                              }),
                              className:
                                'ui-text-dark-teal ui-text-sm ui-font-normal ui-mb-4',
                            },
                            {
                              label: textGrouper({
                                text1: t(
                                  'transactionCreate:transaction_return_from_facility.input_table.detail_column.number_of_returns_in_stock'
                                ),
                                text2: thousand(
                                  Number(data?.return_qty ?? 0) -
                                    Number(data?.discard_qty ?? 0),
                                  0
                                )?.toString(),
                                separator: ': ',
                              }),
                              className:
                                'ui-text-dark-teal ui-text-sm ui-font-normal ui-mb-4',
                            },
                          ]}
                        />
                        <Button
                          onClick={() =>
                            setDiscardStockData({ ...data, index })
                          }
                          type="button"
                          variant="subtle"
                          className="ui-p-0 ui-w-fit"
                          disabled={!returnQty || Number(returnQty) <= 0}
                        >
                          {t('common:edit')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setDiscardStockData({ ...data, index })}
                        leftIcon={<Plus className="h-5 w-5" />}
                        type="button"
                        variant="outline"
                        disabled={!returnQty || Number(returnQty) <= 0}
                      >
                        {t('common:add')}
                      </Button>
                    )}
                  </Td>
                  <Td>
                    <div className="ui-flex ui-justify-start ui-items-center ui-gap-4">
                      <Button
                        variant="subtle"
                        className="ui-p-0 ui-w-fit"
                        type="button"
                        onClick={() => setStockData({ ...data, index })}
                      >
                        {t('common:detail')}
                      </Button>
                      <Button
                        variant="subtle"
                        color="danger"
                        type="button"
                        className="ui-p-0 ui-w-fit"
                        onClick={() => handleDeleteTransaction(index)}
                      >
                        {t('common:remove')}
                      </Button>
                    </div>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
          <TableEmpty colSpan={8}>
            <EmptyState
              title={t('common:message.empty.title')}
              description={t('common:message.empty.description')}
              withIcon
            />
          </TableEmpty>
        </Table>
      </div>
      <style>{`
        #transaction__return__from__facility__input__table table td {
          vertical-align: top !important;
          font-weight: 400;
        }

        #transaction__return__from__facility__input__table table td:has(div#stock_on_hand_td) {
          padding: 0 !important;
          height: 100%;
        }

      ${!fields || fields.length === 0 ? `#transaction__return__from__facility__input__table tbody tr td { height: 200px !important; }` : ''}
      `}</style>
    </>
  )
}

export default TransactionReturnFromFacilityItemTable
