import React from 'react'
import Plus from '#components/icons/Plus'
import { OptionType, ReactSelect } from '#components/react-select'
import { UseFormSetValue } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItem, Stock } from '../order-create-return.type'

type Props = {
  material_stocks: {
    valid: Stock[]
    expired: Stock[]
  }
  order_items: OrderItem[]
  setValue: UseFormSetValue<OrderItem>
  getFilteredActivities: () => OptionType[]
}
export const OrderCreateReturnBatchDropdownOtherActivities: React.FC<Props> = ({
  order_items,
  material_stocks,
  setValue,
  getFilteredActivities,
}) => {
  const { t } = useTranslation(['common', 'orderCreateReturn'])

  const updateBatch = (value: OrderItem['material_stocks']['valid']) => {
    const validStock = value?.filter(
      (stock) =>
        new Date(stock?.batch_expiry_date ?? '') > new Date() ||
        stock?.batch_expiry_date === undefined
    )
    const expiredStock = value?.filter((stock) => {
      return (
        new Date(stock?.batch_expiry_date ?? '') <= new Date() &&
        stock?.batch_expiry_date !== undefined
      )
    })

    const updatedBatch = {
      valid: material_stocks?.valid?.concat(validStock),
      expired: material_stocks?.expired.concat(expiredStock),
    }

    return setValue('material_stocks', updatedBatch)
  }

  return (
    <div className="ui-space-y-6 ui-flex ui-flex-row ui-items-center">
      <h6 className="ui-text-base ui-text-primary-800 ui-flex ui-flex-row ui-items-center ui-mt-6">
        <span className="ui-mr-2">
          <Plus />
        </span>
        {t('orderCreateReturn:drawer.take_stock_from_other_activities.label')}
      </h6>
      <ReactSelect
        key={order_items?.length}
        className="ui-ml-2"
        placeholder={t(
          'orderCreateReturn:drawer.take_stock_from_other_activities.placeholder'
        )}
        options={getFilteredActivities()}
        value={null}
        onChange={(option: {
          label: string
          value: OrderItem['material_stocks']['valid']
        }) => {
          updateBatch(option?.value)
        }}
        menuPosition="fixed"
      />
    </div>
  )
}
