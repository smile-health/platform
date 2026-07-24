import React from 'react'
import { FormErrorMessage } from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { Td } from '#components/table'
import { FieldErrors } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadStocksOrderReturn } from '../order-create-return.service'
import { OrderItem, TOrderCreateReturnForm } from '../order-create-return.type'

type Props = {
  order_items: OrderItem[]
  customer: OptionType | null | undefined
  activity: OptionType | null
  orderItemsMaterialId: number[]
  onSelectDropdown: (option: OptionType) => void
  errors: FieldErrors<TOrderCreateReturnForm>
}

export const OrderCreateReturnTableDropdownMaterial: React.FC<Props> = ({
  order_items,
  customer,
  activity,
  orderItemsMaterialId,
  onSelectDropdown,
  errors,
}) => {
  const { t } = useTranslation(['orderCreateReturn', 'common'])
  return (
    <Td colSpan={6} className="ui-p-2">
      <ReactSelectAsync
        key={order_items?.length}
        loadOptions={(keyword, _, additional) =>
          loadStocksOrderReturn(keyword, _, additional) as any
        }
        onChange={(option: OptionType) => {
          onSelectDropdown(option)
        }}
        additional={{
          page: 1,
          activity: activity,
          entity_id: customer?.value,
          material_ids: orderItemsMaterialId,
        }}
        isOptionDisabled={(option) => {
          return option.value?.material_available_qty <= 0
        }}
        value={null}
        className="!ui-w-96"
        placeholder={t('orderCreateReturn:list.selected.column.add_material')}
        menuPortalTarget={document.documentElement}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        error={!!errors?.order_items?.message}
      />
      {errors?.order_items && (
        <div className="ui-mt-2">
          <FormErrorMessage>
            {errors?.order_items?.message as string}
          </FormErrorMessage>
        </div>
      )}
    </Td>
  )
}
