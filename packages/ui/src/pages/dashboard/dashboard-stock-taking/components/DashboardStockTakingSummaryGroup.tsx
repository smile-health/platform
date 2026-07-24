import { H5 } from '#components/heading'
import cx from '#lib/cx'

import DashboardStockTakingSummaryBox from './DashboardStockTakingSummaryBox'

type Props = Readonly<{
  title: string
  list?: {
    title: string
    value: number
    percentage?: number
    colorClass: string
  }[]
  gridColsClass: string
}>

export default function DashboardStockTakingSummaryGroup(props: Props) {
  const { title, list = [], gridColsClass } = props

  return (
    <div className="ui-space-y-1">
      <H5>{title}</H5>
      <div className={cx('ui-grid ui-gap-4', gridColsClass)}>
        {list.map((item) => (
          <DashboardStockTakingSummaryBox
            key={item?.title}
            title={item?.title}
            value={item?.value}
            percentage={item?.percentage}
            colorClass={item?.colorClass}
          />
        ))}
      </div>
    </div>
  )
}
