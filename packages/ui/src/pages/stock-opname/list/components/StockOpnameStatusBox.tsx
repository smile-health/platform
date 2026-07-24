import React, { FC } from 'react'
import { BOOLEAN } from '#constants/common'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type StockOpnameStatusBoxProps = {
  status: number
}
const StockOpnameStatusBox: FC<StockOpnameStatusBoxProps> = ({ status }) => {
  const { t } = useTranslation(['common', 'stockOpname'])

  const boxStyle = cx(
    'ui-text-sm ui-font-normal ui-text-center',
    'ui-py-1 ui-px-4 ui-w-fit ui-rounded-full',
    {
      'ui-text-green-700 ui-bg-green-50': status === BOOLEAN.TRUE,
      'ui-text-neutral-500 ui-bg-stone-100': status === BOOLEAN.FALSE,
    }
  )

  return (
    <div className={boxStyle}>
      {status === BOOLEAN.TRUE
        ? t('stockOpname:columns.stock_opname_new_has_opnamed')
        : t('stockOpname:columns.stock_opname_new_has_not_opnamed')}
    </div>
  )
}

export default StockOpnameStatusBox
