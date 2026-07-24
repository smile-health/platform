import React from 'react'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { OrderItem } from '../order-create-return.type'

type Props = {
  order_items: OrderItem[]
  indexRow: number
}

export const OrderCreateReturnBatchTableInformation: React.FC<Props> = ({
  order_items,
  indexRow,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreateReturn'])

  const minMax = (min: number | null, max: number | null) => {
    return min || max
      ? `(${[
          min && `min: ${numberFormatter(min, language)}`,
          max && `max : ${numberFormatter(max, language)}`,
        ]
          .filter(Boolean)
          .join(', ')})`
      : null
  }

  return (
    <div className="ui-flex ui-items-center ui-gap-10">
      <div className="ui-max-w-60">
        <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
          Material
        </h2>
        <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-truncate">
          {order_items?.[indexRow]?.material_name}
        </p>
      </div>
      <div className="ui-max-w-60">
        <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
          {t('orderCreateReturn:drawer.stock_on_hand')}
        </h2>
        <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
          {numberFormatter(
            order_items?.[indexRow]?.material_total_qty || 0,
            language
          )}
          <span className="ui-text-neutral-500 ui-text-xs ui-font-normal ui-ml-1">
            {minMax(
              order_items?.[indexRow]?.material_min || null,
              order_items?.[indexRow]?.material_max || null
            )}
          </span>
        </p>
      </div>
      <div className="ui-max-w-60">
        <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
          {t('orderCreateReturn:drawer.available_stock')}
        </h2>
        <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
          {numberFormatter(
            order_items?.[indexRow]?.material_available_qty || 0,
            language
          )}
        </p>
      </div>
    </div>
  )
}
