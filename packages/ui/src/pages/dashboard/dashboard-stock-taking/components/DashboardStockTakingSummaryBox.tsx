import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  title: string
  value: number
  percentage?: number
  colorClass: string
}>

export default function DashboardStockTakingSummaryBox(props: Props) {
  const { title, value, percentage = 0, colorClass } = props

  const {
    i18n: { language },
  } = useTranslation('dashboardStockTaking')

  return (
    <div
      className={cx(
        'ui-flex ui-flex-col ui-justify-between ui-gap-6 ui-p-4 ui-rounded-md',
        colorClass
      )}
    >
      <h6 className="ui-text-sm">{title}</h6>
      <div className="ui-flex ui-justify-between ui-items-center ui-gap-1">
        <p className="ui-text-lg">{numberFormatter(value, language)}</p>
        {percentage > 0 && (
          <div className="ui-py-0.5 ui-px-3 ui-rounded-full ui-bg-white ui-text-dark-blue">
            <span className="ui-text-sm">{percentage}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
