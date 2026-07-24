import React from 'react'
import { FormControl, FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStockQualities } from '../../transaction.services'

type Props = {
  id: string
  name: string
  onChange?: (value: OptionType) => void
  menuPortalTarget?: HTMLElement | null
  control: Control<any, any>
}

const TransactionCreateSelectMaterialStatus: React.FC<Props> = (props) => {
  const { id, name, onChange: handleChange, menuPortalTarget, control } = props
  const { t } = useTranslation('transactionCreate')

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { value, onChange, ...field },
        fieldState: { error },
      }) => (
        <FormControl>
          <ReactSelectAsync
            id={`select-material-status-${id}`}
            {...(!handleChange && { ...field })}
            loadOptions={(keyword, _, additional) =>
              loadStockQualities(keyword, _, additional || { page: 1 }) as any
            }
            value={value}
            onChange={(value: OptionType) =>
              handleChange ? handleChange(value) : onChange(value)
            }
            placeholder={t('table.placeholder.material_status')}
            additional={{ page: 1 }}
            menuPortalTarget={menuPortalTarget}
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

export default TransactionCreateSelectMaterialStatus
