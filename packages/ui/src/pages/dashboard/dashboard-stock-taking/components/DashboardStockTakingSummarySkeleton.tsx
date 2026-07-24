import { Fragment } from 'react'
import { Skeleton } from '#components/skeleton'
import cx from '#lib/cx'

import { StockTakingType } from '../dashboard-stock-taking.constant'

type Props = Readonly<{
  type: StockTakingType
}>

export default function DashboardStockTakingSummarySkeleton(props: Props) {
  const { type } = props
  const isEntity = type === 'entity'
  const length = isEntity ? 12 : 15
  const loadingLength = Array(length).fill(0)

  return (
    <div
      className={cx('ui-grid ui-gap-4', {
        'ui-grid-cols-3': isEntity,
        'ui-grid-cols-5': !isEntity,
      })}
    >
      {loadingLength?.map((_, i) => {
        const index = i + 1
        const divided = isEntity ? 3 : 5

        return (
          <Fragment key={index}>
            {i % divided === 0 && (
              <Skeleton
                className={cx('ui-h-5 ui-w-40', {
                  'ui-col-span-3': isEntity,
                  'ui-col-span-5': !isEntity,
                })}
              />
            )}
            <Skeleton className="ui-h-[120px] ui-mb-2" />
          </Fragment>
        )
      })}
    </div>
  )
}
