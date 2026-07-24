import React, { useContext, useEffect } from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { BOOLEAN } from '#constants/common'
import { useTranslation } from 'react-i18next'

import { loadReason } from '../../../transaction.services'
import { TRANSACTION_TYPE } from '../../transaction-create.constant'
import TransactionRemoveStockContext from '../transaction-remove-stock.context'

type Props = {
  handleValueChange?: (value: {
    index: number
    name: string
    value: OptionType | string | null
    dep?: Array<{ name: string; message: string }>
  }) => void
  index: number
  is_restricted?: number
}

const TransactionRemoveStockSelectReason: React.FC<Props> = ({
  handleValueChange,
  index,
  is_restricted,
}) => {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const { errorForms, savedStockData } = useContext(
    TransactionRemoveStockContext
  )

  useEffect(() => {
    if (
      (
        savedStockData?.stocks?.[index]?.transaction_reason as OptionType & {
          is_other?: number
        }
      )?.is_other !== BOOLEAN.TRUE
    ) {
      handleValueChange?.({
        index,
        name: 'other_reason',
        value: null,
      })
    }
  }, [
    savedStockData?.stocks?.[index]?.transaction_reason as OptionType & {
      is_other?: number
    },
  ])

  return (
    <>
      <FormControl>
        <ReactSelectAsync
          id={`select_transaction_reason_${index}`}
          value={savedStockData?.stocks?.[index]?.transaction_reason ?? null}
          loadOptions={loadReason}
          debounceTimeout={300}
          menuPlacement="top"
          isClearable
          placeholder={t(
            'transactionCreate:transaction_remove_stock.input_table.column.placeholder.reason'
          )}
          additional={{
            page: 1,
            transaction_type_id: TRANSACTION_TYPE.REMOVE_STOCK as number,
          }}
          onChange={(option: OptionType) => {
            handleValueChange?.({
              index,
              name: 'transaction_reason',
              value: option ?? null,
              dep: [
                {
                  name: 'material_status',
                  message: t('common:validation.required'),
                },
                {
                  name: 'input_qty',
                  message: t('common:validation.required'),
                },
                {
                  name: 'other_reason',
                  message: t('common:validation.required'),
                },
              ],
            })
          }}
          menuPosition="fixed"
          disabled={is_restricted === BOOLEAN.TRUE}
        />
        <FormErrorMessage>
          {errorForms?.[`stocks[${index}].transaction_reason`]}
        </FormErrorMessage>
      </FormControl>
      {(
        savedStockData?.stocks?.[index]?.transaction_reason as OptionType & {
          is_other?: number
        }
      )?.is_other === BOOLEAN.TRUE && (
        <FormControl className="ui-mt-4">
          <Input
            id={`input_transaction_reason_other_${index}`}
            value={savedStockData?.stocks?.[index]?.other_reason ?? ''}
            maxLength={255}
            onChange={(e) => {
              handleValueChange?.({
                index,
                name: 'other_reason',
                value: e.target.value,
              })
            }}
            placeholder={t(
              'transactionCreate:transaction_remove_stock.input_table.column.placeholder.other'
            )}
          />
          <FormErrorMessage>
            {errorForms?.[`stocks[${index}].other_reason`]}
          </FormErrorMessage>
        </FormControl>
      )}
    </>
  )
}

export default TransactionRemoveStockSelectReason
