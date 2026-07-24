import React, { useContext } from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { useTranslation } from 'react-i18next'

import { loadReason } from '../../../transaction.services'
import { TRANSACTION_TYPE } from '../../transaction-create.constant'
import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'

type Props = {
  handleValueChange?: ({
    name,
    value,
    dep,
  }: {
    name: string
    value: string | OptionType | number | null
    dep?: Array<{
      name: string
      message: string
    }>
  }) => void
}

const TransactionReturnFromFacilitySelectReason: React.FC<Props> = ({
  handleValueChange,
}) => {
  const { t } = useTranslation(['transactionCreate', 'common'])
  const { errorForms, discardStockData } = useContext(
    TransactionReturnFromFacilityContext
  )

  return (
    <FormControl>
      <ReactSelectAsync
        id="select_discard_reason"
        defaultValue={discardStockData?.discard_reason}
        loadOptions={loadReason}
        debounceTimeout={300}
        isClearable
        placeholder={t(
          'transactionCreate:transaction_return_from_facility.input_table.column.placeholder.reason'
        )}
        additional={{
          page: 1,
          transaction_type_id: TRANSACTION_TYPE.DISCARD as number,
        }}
        onChange={(option: OptionType) => {
          handleValueChange?.({
            name: 'discard_reason',
            value: option ?? null,
            dep: [
              {
                name: 'discard_qty',
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
      />
      <FormErrorMessage>{errorForms?.discard_reason}</FormErrorMessage>
    </FormControl>
  )
}

export default TransactionReturnFromFacilitySelectReason
