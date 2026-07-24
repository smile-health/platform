import { useContext } from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStatusVVM } from '../../../transaction.services'
import { thousandFormatter } from '../transaction-remove-stock.common'
import TransactionRemoveStockContext from '../transaction-remove-stock.context'
import {
  CreateTransactionRemoveForm,
  TDetailMaterials,
} from '../transaction-remove-stock.type'
import { transactionRemoveStockBatchValidation } from '../transaction-remove-stock.validation-schema'
import TransactionRemoveStockSelectReason from './TransactionRemoveStockSelectReason'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { BOOLEAN } from '#constants/common'

const TitleBlock = ({
  arrText,
}: {
  arrText: Array<{
    label: string
    className?: string
  }>
}) => (
  <div>
    {arrText.map(
      (item, index) =>
        item.label && (
          <div
            key={`_${index.toString()}`}
            className={`${
              item.className ? item.className : 'ui-text-dark-teal'
            } ui-text-sm`}
          >
            {item.label}
          </div>
        )
    )}
  </div>
)

const TransactionRemoveStockItemDetailBatchTable: React.FC = () => {
  const { t, i18n } = useTranslation(['transactionCreate', 'common'])
  const locale = i18n.language
  const methods = useFormContext<CreateTransactionRemoveForm>()
  const { savedStockData, setSavedStockData, errorForms, setErrorForms } =
    useContext(TransactionRemoveStockContext)
  const itemIndex = methods
    .watch('items')
    ?.findIndex((item) => item?.material?.id === savedStockData?.material?.id)

  const formatDate = (date: string) =>
    date ? dayjs(date).locale(i18n.language).format('DD MMM YYYY') : '-'

  const handleError = async ({
    index,
    name,
    updatedStock,
  }: {
    index: number
    name: string
    updatedStock: TDetailMaterials
  }) => {
    setSavedStockData(updatedStock)
    const fieldPath = `stocks[${index}].${name}`
    try {
      await transactionRemoveStockBatchValidation(t).validateAt(
        fieldPath,
        updatedStock
      )
      setErrorForms((prev: any) => ({
        ...prev,
        [fieldPath]: null,
      }))
    } catch (error: any) {
      setErrorForms((prev: any) => ({
        ...prev,
        [fieldPath]: error.message,
      }))
    }
  }

  const handleValueChange = ({
    index,
    name,
    value,
    dep,
  }: {
    index: number
    name: string
    value: string | OptionType | number | null
    dep?: Array<{
      name: string
      message: string
    }>
  }) => {
    const updatedStock = {
      ...savedStockData,
      stocks: savedStockData?.stocks.map((stock: any, idx: number) =>
        idx === index
          ? {
              ...stock,
              [name]: value,
            }
          : stock
      ),
    }
    setSavedStockData(updatedStock as TDetailMaterials)
    handleError({ index, name, updatedStock: updatedStock as TDetailMaterials })
    if (dep) {
      dep.forEach((item) => {
        handleError({
          index,
          name: item.name,
          updatedStock: updatedStock as TDetailMaterials,
        })
      })
    }
  }
  return (
    <div
      className="transaction__remove__stock__input__batch__table"
      id={`transaction__remove__stock__input__batch__table__${itemIndex}`}
    >
      <Table layout="fixed" overflowXAuto withBorder>
        <Thead>
          <Th className="ui-w-12">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              SI.No
            </div>
          </Th>
          <Th className="ui-w-36">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t(
                'transactionCreate:transaction_remove_stock.input_table.detail_column.batch_info'
              )}
            </div>
          </Th>
          <Th className="ui-w-36">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t(
                'transactionCreate:transaction_remove_stock.input_table.detail_column.stock_info'
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
                'transactionCreate:transaction_remove_stock.input_table.column.quantity'
              )}
            </div>
          </Th>
          {(
            savedStockData?.material as {
              is_temperature_sensitive: number
            }
          )?.is_temperature_sensitive === BOOLEAN.TRUE && (
            <Th className="ui-w-52">
              <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
                {t(
                  'transactionCreate:transaction_remove_stock.input_table.detail_column.material_status'
                )}
              </div>
            </Th>
          )}
          <Th className="ui-w-52">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t(
                'transactionCreate:transaction_remove_stock.input_table.column.reason'
              )}
            </div>
          </Th>
        </Thead>
        <Tbody className="ui-bg-white ui-group ui-text-sm ui-font-normal">
          {savedStockData?.stocks?.map((data, index) => {
            const dataBatch = data?.batch
            const thousand = (value: number) =>
              value ? thousandFormatter({ value, locale }) : '-'
            return (
              <Tr
                key={`transaction_remove_stock_input_batch_table_${index?.toString()}`}
              >
                <Td>{index + 1}</Td>
                <Td>
                  {savedStockData?.material?.is_managed_in_batch ===
                  BOOLEAN.TRUE ? (
                    <TitleBlock
                      arrText={[
                        {
                          label: dataBatch?.code ?? '-',
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-bold',
                        },
                        {
                          label: `${t(
                            'transactionCreate:transaction_remove_stock.input_table.detail_column.production_date'
                          )}: ${formatDate(dataBatch?.production_date as string)}`,
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-normal',
                        },
                        {
                          label: `${t(
                            'transactionCreate:transaction_remove_stock.input_table.detail_column.manufacturer'
                          )}: ${dataBatch?.manufacture?.name ?? '-'}`,
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-normal',
                        },
                        {
                          label: `${t(
                            'transactionCreate:transaction_remove_stock.input_table.detail_column.expired_date'
                          )}: ${formatDate(dataBatch?.expired_date as string)}`,
                          className:
                            'ui-text-dark-teal ui-text-sm ui-font-normal',
                        },
                      ]}
                    />
                  ) : (
                    '-'
                  )}
                </Td>
                <Td>
                  <TitleBlock
                    arrText={[
                      {
                        label: `${t(
                          'transactionCreate:transaction_remove_stock.input_table.column.stock_on_hand'
                        )}: ${thousand(data?.qty)}`,
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                      {
                        label: `${t(
                          'transactionCreate:transaction_remove_stock.input_table.detail_column.allocated'
                        )}: ${thousand(data?.allocated_qty)}`,
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                      {
                        label: `${t(
                          'transactionCreate:transaction_remove_stock.input_table.column.available_stock'
                        )}: ${thousand(data?.available_qty)}`,
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                      {
                        label: `${t(
                          'transactionCreate:transaction_remove_stock.input_table.column.budget_source'
                        )}: ${data?.budget_source?.name ?? '-'}`,
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                    ]}
                  />
                </Td>
                <Td>{data?.activity?.name}</Td>
                <Td>
                  <InputNumberV2
                    placeholder={t(
                      'transactionCreate:transaction_remove_stock.input_table.detail_column.placeholder.qty'
                    )}
                    value={data?.input_qty ?? ''}
                    onValueChange={(values) =>
                      handleValueChange({
                        index,
                        name: 'input_qty',
                        value: values?.floatValue as number,
                        dep: [
                          {
                            name: 'material_status',
                            message: t('common:validation.required'),
                          },
                          {
                            name: 'transaction_reason',
                            message: t('common:validation.required'),
                          },
                        ],
                      })
                    }
                    disabled={
                      data?.budget_source?.is_restricted === BOOLEAN.TRUE
                    }
                  />
                  {data?.budget_source?.is_restricted === BOOLEAN.TRUE && (
                    <p className="ui-text-neutral-500 ui-text-sm ui-font-normal">
                      {t(
                        'transactionCreate:transaction_remove_stock.input_table.column.restricted_budget_source'
                      )}
                    </p>
                  )}
                  <FormErrorMessage>
                    {errorForms?.[`stocks[${index}].input_qty`]}
                  </FormErrorMessage>
                </Td>
                {(
                  savedStockData?.material as {
                    is_temperature_sensitive: number
                  }
                )?.is_temperature_sensitive === BOOLEAN.TRUE && (
                  <Td>
                    <FormControl>
                      <ReactSelectAsync
                        value={data?.material_status as OptionType}
                        id={`select_material_status_${itemIndex}_${index}`}
                        loadOptions={loadStatusVVM}
                        debounceTimeout={300}
                        isClearable
                        disabled={
                          data?.budget_source?.is_restricted === BOOLEAN.TRUE
                        }
                        placeholder={t(
                          'transactionCreate:transaction_remove_stock.input_table.detail_column.placeholder.status'
                        )}
                        additional={{
                          page: 1,
                        }}
                        onChange={(option: OptionType) => {
                          handleValueChange({
                            index,
                            name: 'material_status',
                            value: option,
                            dep: [
                              {
                                name: 'input_qty',
                                message: t('common:validation.required'),
                              },
                            ],
                          })
                        }}
                        menuPosition="fixed"
                      />
                      <FormErrorMessage>
                        {errorForms?.[`stocks[${index}].material_status`]}
                      </FormErrorMessage>
                    </FormControl>
                  </Td>
                )}
                <Td>
                  <TransactionRemoveStockSelectReason
                    handleValueChange={handleValueChange}
                    index={index}
                    is_restricted={data?.budget_source?.is_restricted}
                  />
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </div>
  )
}

export default TransactionRemoveStockItemDetailBatchTable
