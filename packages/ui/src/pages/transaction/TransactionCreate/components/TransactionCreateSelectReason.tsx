import React from 'react'
import { useRouter } from 'next/router'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadReason } from '../../transaction.services'
import { CreateTransctionForm } from '../transaction-create.type'

type Props = {
  id: string
  name: string
  onChange?: (value: OptionType) => void
  menuPortalTarget?: HTMLElement | null
  control: Control<any, any>
}

const TransactionCreateSelectReason: React.FC<Props> = (props) => {
  const { id, name, onChange: handleChange, menuPortalTarget, control } = props
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreate')
  const { query } = useRouter()
  const { type } = query

  return (
    <Controller
      control={control}
      name={name as keyof CreateTransctionForm}
      render={({
        field: { value, onChange, ...field },
        fieldState: { error },
      }) => (
        <FormControl>
          <ReactSelectAsync
            key={`${name}_${language}`}
            id={`select-reason-${id}`}
            {...(!handleChange && { ...field })}
            loadOptions={loadReason}
            value={value}
            onChange={(value: OptionType) =>
              handleChange ? handleChange(value) : onChange(value)
            }
            placeholder={t('table.placeholder.reason')}
            additional={{
              page: 1,
              transaction_type_id: Number(type),
            }}
            menuPortalTarget={menuPortalTarget}
            disabled={!type}
            isClearable
            error={!!error?.message}
            menuPosition="fixed"
            menuPlacement="top"
          />
          {error?.message && (
            <FormErrorMessage>{error?.message}</FormErrorMessage>
          )}
        </FormControl>
      )}
    />
  )
}

export default TransactionCreateSelectReason
