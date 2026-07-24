import React, { Fragment } from 'react'
import { Button } from '#components/button'
import Reload from '#components/icons/Reload'
import { UseFormHandleSubmit } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { OrderItem } from '../order-create-return.type'

type Props = {
  indexRow: number
  activity: number
  material_stocks: OrderItem['material_stocks']
  setValue: (fieldName: string, value: any) => void
  handleSaveUpdate: () => void
  handleSubmit: UseFormHandleSubmit<OrderItem, undefined>
  setResetKey: React.Dispatch<React.SetStateAction<number>>
}

export const OrderCreateReturnBatchButtonGroup: React.FC<Props> = ({
  activity,
  indexRow,
  material_stocks,
  setValue,
  handleSaveUpdate,
  handleSubmit,
  setResetKey,
}) => {
  const { t } = useTranslation(['common', 'orderCreateReturn'])

  const resetChildren = {
    valid: material_stocks?.valid
      .filter((stock) => stock?.batch_activity?.id === activity)
      .map((stock) => ({
        ...stock,
        batch_ordered_qty: null,
        batch_order_stock_status_id: null,
      })),
    expired: material_stocks?.expired
      .filter((stock) => stock?.batch_activity?.id === activity)
      .map((stock) => ({
        ...stock,
        batch_ordered_qty: null,
        batch_order_stock_status_id: null,
      })),
  }

  return (
    <Fragment>
      <Button
        id={`reset-batch-${indexRow}`}
        variant="subtle"
        onClick={() => {
          setValue('material_stocks', resetChildren)
          setResetKey((prev) => prev + 1)
        }}
      >
        <div className="ui-flex ui-flex-row ui-text-sm ui-space-x-3 ui-text-primary-600">
          <Reload className="ui-size-5" />
          <div>Reset</div>
        </div>
      </Button>

      <Button
        variant="solid"
        id={`save-batch-${indexRow}`}
        onClick={() => {
          handleSubmit(handleSaveUpdate)()
        }}
      >
        {t('common:save')}
      </Button>
    </Fragment>
  )
}
