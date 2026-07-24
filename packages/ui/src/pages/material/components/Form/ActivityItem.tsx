import { MouseEventHandler } from 'react'
import cx from '#lib/cx'
import { ActivityData } from '#types/activity'

type ActivityItemProps = Readonly<{
  id: number
  activity: ActivityData
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: {
    wrapper?: string
    logo?: string
    label?: string
    title?: string
  }
}>

export function ActivityItem({
  id,
  activity,
  className,
  onClick,
}: ActivityItemProps) {
  return (
    <button
      id={id.toString()}
      data-testid={id}
      onClick={onClick}
      type="button"
      className={cx(
        'ui-flex ui-items-center gap-3 focus:outline-none',
        className?.wrapper
      )}
    >
      <p className={cx('ui-text-lg ui-font-bold', className?.title)}>
        {activity?.name}
      </p>
    </button>
  )
}
