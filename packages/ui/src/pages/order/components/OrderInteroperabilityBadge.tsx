import cx from '#lib/cx'

type OrderInteroperabilityBadge = {
  className?: string
  client: string
}

const OrderInteroperabilityBadge = ({
  className,
  client,
}: OrderInteroperabilityBadge) => {
  return (
    <div
      className={cx(
        'ui-border ui-border-primary-500 ui-text-primary-500 ui-bg-primary-100 py-1.5 ui-font-medium ui-px-2.5 ui-uppercase rounded-full',
        className
      )}
    >
      {client}
    </div>
  )
}

export default OrderInteroperabilityBadge
