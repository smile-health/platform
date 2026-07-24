import { MouseEventHandler } from 'react'
import { TProgramPoc, WORKSPACE } from '#constants/program'
import cx from '#lib/cx'

type ProgramPocItemProps = Readonly<{
  id: string
  data: TProgramPoc
  direction?: 'vertical' | 'horizontal'
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: {
    wrapper?: string
    logo?: string
    label?: string
    title?: string
  }
}>

export function ProgramPocItem({
  direction = 'horizontal',
  id,
  data,
  className,
  onClick,
  disabled,
}: ProgramPocItemProps) {
  const key = data?.key

  const additionalProps = {
    role: 'button',
    tabIndex: 0,
  }

  return (
    <button
      id={id}
      onClick={onClick}
      {...(onClick && additionalProps)}
      className={cx(
        'ui-flex ui-items-center gap-3',
        {
          'ui-flex-col': direction === 'vertical',
          'ui-flex-row': direction === 'horizontal',
        },
        className?.wrapper
      )}
    >
      <div
        className={cx(
          'ui-rounded ui-grid ui-place-items-center ui-w-10 ui-h-10',
          WORKSPACE[key].bg,
          className?.logo,
          { 'ui-bg-slate-200': disabled }
        )}
      >
        <span
          className={cx(
            'ui-font-medium',
            WORKSPACE[key].color,
            className?.label,
            { 'ui-text-slate-300': disabled }
          )}
        >
          {WORKSPACE[key].label}
        </span>
      </div>
      <p
        className={cx('ui-text-lg ui-font-bold', className?.title, {
          'ui-text-neutral-500': disabled,
        })}
      >
        {data?.name}
      </p>
    </button>
  )
}
