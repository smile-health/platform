import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

const MONTHS_EN = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]

const MONTHS_IN = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MEI',
  'JUN',
  'JUL',
  'AGS',
  'SEP',
  'OKT',
  'NOV',
  'DES',
]

type MonthlyWrapperProps = {
  values: number[]
  onClick: (monthIndex: number) => void
}

export const MonthWrapper = ({ values, onClick }: MonthlyWrapperProps) => {
  const { i18n } = useTranslation()

  const months = i18n.language === 'id' ? MONTHS_IN : MONTHS_EN

  return (
    <div className="ui-grid ui-grid-cols-3 ui-gap-1">
      {months.map((month, index) => (
        <button
          key={month}
          type="button"
          className={cx(
            'ui-border ui-rounded ui-text-sm ui-font-bold ui-text-center ui-px-4 ui-py-[10px] ui-transition',
            {
              'ui-border-gray-300 hover:ui-bg-[#effaff]': !values.includes(
                index + 1
              ),
              'ui-border-[#004990] ui-bg-[#E2F3FC]': values.includes(index + 1),
            }
          )}
          onClick={() => onClick(index + 1)}
        >
          {month}
        </button>
      ))}
    </div>
  )
}
