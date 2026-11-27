import { MouseEventHandler } from 'react'
import Image from 'next/image'
import cx from '#lib/cx'
import { TProgram } from '#types/program'
import { getReadableTextColor } from '#utils/color'
import { getLocalizedProgramName } from '#utils/localized-name'
import { generateInitials } from '#utils/strings'
import { useTranslation } from 'react-i18next'

type ProgramItemProps = Readonly<{
  id: string
  data?: TProgram
  direction?: 'vertical' | 'horizontal'
  onClick?: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  className?: {
    wrapper?: string
    logo?: string
    label?: string
    title?: string
  }
  icon?: string
  sizeIcon?: number
}>

export function ProgramItem({
  direction = 'horizontal',
  id,
  data,
  className,
  onClick,
  disabled,
  icon,
  sizeIcon = 40,
}: ProgramItemProps) {
  const {
    i18n: { language },
  } = useTranslation()
  const setTextColor = (color?: string) => {
    if (!color) return 'ui:text-black'

    const text = getReadableTextColor(color)

    return text === 'light' ? 'ui:text-white' : 'ui:text-black'
  }

  return (
    <button
      id={id}
      data-testid={id}
      onClick={onClick}
      type="button"
      className={cx(
        'ui:flex ui:items-center focus:outline-none gap-3',
        {
          'ui:flex-col': direction === 'vertical',
          'ui:flex-row': direction === 'horizontal',
          'ui:cursor-not-allowed': disabled,
        },
        className?.wrapper
      )}
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
            'ui:rounded ui:grid ui:place-items-center ui:w-10 ui:h-10',
            className?.logo
          )}
          style={{
            background: disabled
              ? '#e2e8f0'
              : (data?.config?.color ?? data?.color),
          }}
        >
          <span
            className={cx(
              'ui:font-medium',
              setTextColor(data?.config?.color ?? data?.color),
              className?.label,
              { 'ui:text-slate-300': disabled }
            )}
          >
            {generateInitials(data?.name || '')}
          </span>
        </div>
      )}
      <p
        className={cx('ui:text-lg ui:font-bold', className?.title, {
          'ui:text-neutral-500': disabled,
        })}
      >
        {getLocalizedProgramName(data, language)}
      </p>
    </button>
  )
}
