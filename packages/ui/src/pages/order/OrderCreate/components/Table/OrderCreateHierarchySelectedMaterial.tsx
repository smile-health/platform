import React from 'react'
import { Exists } from '#components/exists'
import { numberFormatter } from '#utils/formatter'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

type ContentItem = {
  key: string
  className?: string
  content: React.ReactNode
}

type Props = {
  index: number
  indexBatch: number
  stock: any
  showCondition?: boolean
}

export const OrderCreateHierarchySelectedMaterial: React.FC<Props> = ({
  index,
  indexBatch,
  stock,
  showCondition = !!stock?.ordered_qty,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['orderCreate'])

  const defaultContent = {
    material_name: t(
      'orderCreate:list.selected.column.quantity.detail.material_name',
      { name: stock?.name ?? '-' }
    ),
    qty: t('orderCreate:list.selected.column.quantity.detail.qty', {
      value: numberFormatter(stock?.ordered_qty ?? 0, language),
    }),
  }

  return (
    <Exists useIt={showCondition}>
      <div
        className="ui-flex ui-flex-col ui-mb-3"
        key={`${index}-${indexBatch}`}
      >
        {Object.values(defaultContent).map((item) => {
          return (
            <div
              className={clsx('ui-mb-1', {
                'ui-font-bold': item === defaultContent.qty,
              })}
              key={`${index}-${indexBatch}-detail_qty`}
            >
              {item}
            </div>
          )
        })}
      </div>
    </Exists>
  )
}

export default OrderCreateHierarchySelectedMaterial
