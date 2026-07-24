import cx from '#lib/cx'

type ActivityItemProps = {
  id: string
  data?: any
  direction?: 'vertical' | 'horizontal'
  disabled?: boolean
  className?: {
    wrapper?: string
    logo?: string
    label?: string
    title?: string
  }
}

export function ActivityItem({
  direction = 'horizontal',
  ...props
}: Readonly<ActivityItemProps>) {
  const { id, data, className, disabled } = props
  const key = data?.id

  return (
    <div
      key={key}
      id={id}
      className={cx(
        'ui-flex ui-items-center ui-flex-col gap-3',
        className?.wrapper
      )}
    >
      <p
        className={cx('ui-text-lg ui-font-bold ui-ml-4', className?.title, {
          'ui-text-[#737373]': disabled,
        })}
      >
        {data?.name}
      </p>
    </div>
  )
}
