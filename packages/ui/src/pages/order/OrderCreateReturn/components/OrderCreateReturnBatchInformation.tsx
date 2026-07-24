import React from 'react'
import { Td } from '#components/table'
import cx from '#lib/cx'
import { parseDateTime } from '#utils/date'
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

export const OrderCreateReturnBatchInformation: React.FC<Props> = ({
  headers,
  material_stock,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'orderCreateReturn'])
  const isExpired =
    new Date(material_stock?.batch_expiry_date || '') <= new Date()

  return (
    <Td id={`cell-${headers?.[1]?.id}`}>
      <div className="ui-text-dark-blue">
        <strong>{material_stock?.batch_code ?? '-'}</strong>
      </div>
      <div>
        {t('orderCreateReturn:drawer.table.column.batch_info.production_date', {
          date:
            parseDateTime(
              material_stock?.batch_production_date,
              'DD MMM YYYY',
              language
            ).toUpperCase() ?? '-',
        })}
      </div>
      <div>
        {t('orderCreateReturn:drawer.table.column.batch_info.manufacturer', {
          manufacturer: material_stock?.batch_manufacturer ?? '-',
        })}
      </div>
      <div className="ui-flex ui-items-center">
        {t('orderCreateReturn:drawer.table.column.batch_info.expired_date')}
        <span
          className={cx('ui-text-sm', {
            'ui-font-bold ui-text-red-500': isExpired,
          })}
        >
          {parseDateTime(
            material_stock?.batch_expiry_date,
            'DD MMM YYYY',
            language
          ).toUpperCase() ?? '-'}
        </span>
      </div>
    </Td>
  )
}
