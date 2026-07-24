import React from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { ReactSelect } from '#components/react-select'
import { TDetailActivityDate } from '#types/entity'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useTransferStockActivitesOption from '../hooks/useTransferStockActivitesOption'
import { CreateTransactionTransferStock } from '../transaction-transfer-stock.type'

const TransactionCreateTransferStockActivity = ({
  index,
  material_id,
}: {
  index: number
  material_id: number | undefined | null
}) => {
  const { t } = useTranslation('transactionCreate')
  const { watch, control } = useFormContext<CreateTransactionTransferStock>()
  const { entity, destination_program_id } = watch()
  const data = useTransferStockActivitesOption(
    destination_program_id,
    material_id,
    entity
  )
  return (
    <Controller
      control={control}
      name={`items.${index}.destination_activity`}
      key={`select-transaction-transfer-stock-destination-activity-${index}`}
      render={({
        field: { value, onChange, ...field },
        fieldState: { error },
      }) => (
        <FormControl>
          <ReactSelect
            {...field}
            key={`${entity?.value}-${destination_program_id}`}
            value={value}
            id={`select-transaction-transfer-stock-destination-activity-${index}`}
            placeholder={t('placeholder_select_activity')}
            options={data}
            onChange={(option: TDetailActivityDate) => onChange(option)}
            isClearable
            error={!!error?.message}
            menuPosition="fixed"
            menuPlacement="top"
            styles={{
              menuPortal: (base) => ({ ...base, zIndex: 99 }),
            }}
          />
          {error?.message && (
            <FormErrorMessage>{error?.message}</FormErrorMessage>
          )}
        </FormControl>
      )}
    />
  )
}

export default TransactionCreateTransferStockActivity
