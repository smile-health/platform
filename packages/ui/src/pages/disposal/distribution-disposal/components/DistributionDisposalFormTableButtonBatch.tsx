import React from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { DistributionDisposalOrderItemForm } from '../types/DistributionDisposal'

type Props = {
  index: number
  item: DistributionDisposalOrderItemForm
  setSelected: (params: {
    open: boolean
    index: number
    data: DistributionDisposalOrderItemForm
  }) => void
}

const DistributionDisposalFormTableButtonBatch = ({
  index,
  item,
  setSelected,
}: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('distributionDisposal')

  const isBatch = Boolean(item.managed_in_batch)

  const hasValidQty = item.stocks?.some((stock) =>
    stock.stock_exterminations?.some(
      (ex) => ex.received_qty != null || ex.discard_qty != null
    )
  )

  const label = t(
    isBatch
      ? hasValidQty
        ? 'detail.action.update_batch_quantity'
        : 'detail.action.batch_quantity'
      : hasValidQty
        ? 'detail.action.update_quantity'
        : 'detail.action.quantity'
  )

  // 🔽 Pre-process display content to flatten the nested structure
  const batchDisplay = hasValidQty
    ? item?.stocks?.flatMap((stock, stockIdx) => {
        const batchCode = stock.batch?.code || '-'
        return stock?.stock_exterminations
          ?.filter(
            (ex) =>
              Number(ex.discard_qty ?? 0) + Number(ex.received_qty ?? 0) > 0
          )
          .map((ex, exIdx) => ({
            key: `extermination-${stockIdx}-${exIdx}`,
            batchCode,
            reason: ex.transaction_reason_title,
            qty: numberFormatter(
              Number(ex.discard_qty ?? 0) + Number(ex.received_qty ?? 0),
              language
            ),
          }))
      })
    : []

  return (
    <>
      {hasValidQty && (
        <div className="ui-flex ui-flex-col ui-gap-4 ui-mb-5">
          {batchDisplay?.map((arr, idx) => {
            const isFirstOfBatch =
              idx === 0 || arr?.batchCode !== batchDisplay?.[idx - 1]?.batchCode
            return (
              <div key={arr?.key}>
                {isFirstOfBatch && (
                  <p className="ui-font-bold ui-text-dark-teal ui-mb-1">
                    {arr?.batchCode}
                  </p>
                )}
                <p>
                  {arr?.reason} : {arr?.qty}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <Button
        onClick={() => setSelected({ open: true, index, data: item })}
        leftIcon={<Plus className="h-5 w-5" />}
        type="button"
        variant="outline"
        className="ui-w-50"
        id={`button-batch-${index}`}
      >
        {label}
      </Button>
    </>
  )
}

export default DistributionDisposalFormTableButtonBatch
