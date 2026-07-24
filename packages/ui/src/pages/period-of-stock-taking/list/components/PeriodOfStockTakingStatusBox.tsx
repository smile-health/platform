import React, { FC } from 'react'
import { BOOLEAN } from '#constants/common'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type PeriodOfStockTakingStatusBoxProps = {
  status: number
}
const PeriodOfStockTakingStatusBox: FC<PeriodOfStockTakingStatusBoxProps> = ({
  status,
}) => {
  const { t } = useTranslation(['common', 'periodOfStockTaking'])

  const boxStyle = cx(
    'ui-text-sm ui-font-normal ui-text-center ui-whitespace-nowrap',
    'ui-py-1 ui-px-4 ui-w-fit ui-rounded-full',
    {
      'ui-text-green-700 ui-bg-green-50': status === BOOLEAN.TRUE,
      'ui-text-red-600 ui-bg-red-50': status === BOOLEAN.FALSE,
    }
  )

  return (
    <div className={boxStyle}>
      {status === BOOLEAN.TRUE
        ? t('periodOfStockTaking:active')
        : t('periodOfStockTaking:inactive')}
    </div>
  )
}

export default PeriodOfStockTakingStatusBox
