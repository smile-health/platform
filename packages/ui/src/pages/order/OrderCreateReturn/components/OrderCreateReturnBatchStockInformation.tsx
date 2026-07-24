import React from 'react'
import { Td } from '#components/table'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { OrderItem } from '../order-create-return.type'

type Props = {
  headers: {
    header: string
    id: string
    size: number
  }[]
  material_stock: OrderItem['material_stocks'][number]
}

export const OrderCreateReturnBatchStockInformation: React.FC<Props> = ({
  headers,
  material_stock,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreateReturn'])

  return (
    <Td id={`cell-${headers?.[2]?.id}`}>
      <div>
        {t('orderCreateReturn:drawer.table.column.stock_info.stock_on_hand', {
          value: numberFormatter(
            material_stock?.batch_total_qty || 0,
            language
          ),
        })}
      </div>
      <div>
        {t('orderCreateReturn:drawer.table.column.stock_info.available_stock', {
          value: numberFormatter(
            material_stock?.batch_available_qty || 0,
            language
          ),
        })}
      </div>
      <div>
        {t('orderCreateReturn:drawer.table.column.stock_info.allocated', {
          value: numberFormatter(
            material_stock?.batch_allocated_qty || 0,
            language
          ),
        })}
      </div>
    </Td>
  )
}
