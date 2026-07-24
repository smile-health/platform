import { MouseEventHandler } from 'react'
import cx from '#lib/cx'
import { TProtocol } from '#types/protocol'

type ProtocolItemProps = Readonly<{
  id: number
  protocol?: TProtocol
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: {
    wrapper?: string
    logo?: string
    label?: string
    title?: string
  }
}>

export function ProtocolItem({
  id,
  protocol,
  className,
  onClick,
  disabled,
}: ProtocolItemProps) {
  return (
    <button
      id={id.toString()}
      data-testid={id}
      onClick={onClick}
      type="button"
      className={cx(
        'ui-flex ui-items-center gap-3 focus:outline-none',
        {
          'ui-cursor-not-allowed': disabled,
        },
        className?.wrapper
      )}
    >
      <p
        className={cx('ui-text-lg ui-font-bold', className?.title, {
          'ui-text-neutral-500': disabled,
        })}
      >
        {protocol?.name}
      </p>
    </button>
  )
}
