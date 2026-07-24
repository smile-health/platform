import cx from '#lib/cx'
import Image from 'next/image'
import { TProgram } from '#types/program'
import { getReadableTextColor } from '#utils/color'
import { generateInitials } from '#utils/strings'

type ProgramItemLinkProps = Readonly<{
  id: string
  data: TProgram
  direction?: 'vertical' | 'horizontal'
  href: string
  disabled?: boolean
  className?: {
    wrapper?: string
    logo?: string
    label?: string
    title?: string
  }
  onClick?: () => void
  target?: string
  icon?: string
  sizeIcon?: number
}>

export function ProgramItemLink({
  direction = 'horizontal',
  id,
  data,
  className,
  href,
  disabled,
  onClick,
  target,
  icon,
  sizeIcon = 64,
}: ProgramItemLinkProps) {
  const setTextColor = (color?: string) => {
    if (!color) return 'ui-text-black'

    const text = getReadableTextColor(color)

    return text === 'light' ? 'ui-text-white' : 'ui-text-black'
  }

  return (
    <a
      id={id}
      data-testid={id}
      href={href}
      onClick={onClick}
      className={cx(
        'ui-flex ui-items-center focus:outline-none gap-3',
        {
          'ui-flex-col': direction === 'vertical',
          'ui-flex-row': direction === 'horizontal',
          'ui-cursor-not-allowed': disabled,
        },
        className?.wrapper
      )}
      target={target}
    >
      {icon ? (
        <Image
          width={sizeIcon}
          height={sizeIcon}
          src={icon}
          alt={icon}
        />
      ) : (
        <div
          className={cx(
            'ui-rounded ui-grid ui-place-items-center ui-w-10 ui-h-10',
            className?.logo
          )}
          style={{ background: disabled ? '#e2e8f0' : data?.config?.color }}
        >
          <span
            className={cx(
              'ui-font-medium',
              setTextColor(data?.config?.color),
              className?.label,
              { 'ui-text-slate-300': disabled }
            )}
          >
            {generateInitials(data.name)}
          </span>
        </div>
      )}
      <p
        className={cx('ui-text-lg ui-font-bold', className?.title, {
          'ui-text-neutral-500': disabled,
        })}
      >
        {data?.name}
      </p>
    </a>
  )
}
