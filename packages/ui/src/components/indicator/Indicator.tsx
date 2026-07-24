import React from 'react'
import cx from '#lib/cx'

export type IndicatorProps = Readonly<{
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
  animatePing?: boolean
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'
  label?: React.ReactNode
  children?: React.ReactNode
  style?: React.CSSProperties
}>

export function Indicator({
  position = 'top-right',
  animatePing,
  color = 'primary',
  label,
  children,
  style,
}: IndicatorProps) {
  let length = 0
  if (typeof label === 'string') {
    length = label.length
  }

  if (typeof label === 'number') {
    length = String(label).length
  }

  return (
    <div className="ui-flex">
      <div className="ui-relative">
        <span
          style={style}
          className={cx('ui-absolute ui-flex ui-leading-none', {
            'ui-right-1/2 -ui-translate-y-1/2 ui-translate-x-1/2':
              position === 'top-center',
            'ui-left-0 ui-right-auto -ui-translate-x-1/2 -ui-translate-y-1/2 top-0 ':
              position === 'top-left',
            'ui-left-auto ui-right-0 -ui-translate-y-1/2 ui-translate-x-1/2 top-0':
              position === 'top-right',
            'ui-bottom-0 ui-right-1/2 ui-translate-x-1/2 ui-translate-y-1/2':
              position === 'bottom-center',
            'ui-bottom-0 ui-left-0 ui-right-auto -ui-translate-x-1/2 ui-translate-y-1/2':
              position === 'bottom-left',
            'ui-bottom-0 ui-left-auto ui-right-0 ui-translate-x-1/2 ui-translate-y-1/2':
              position === 'bottom-right',
          })}
        >
          <div className="ui-inline-block">
            {animatePing ? (
              <span
                className={cx(
                  'ui-absolute ui-h-full ui-w-full ui-opacity-75 ',
                  'ui-animate-ping ui-rounded-full',
                  {
                    'ui-bg-primary-500': color === 'primary',
                    'ui-bg-secondary-500': color === 'secondary',
                    'ui-bg-success-500': color === 'success',
                    'ui-bg-info-500': color === 'info',
                    'ui-bg-warning-500': color === 'warning',
                    'ui-bg-danger-500': color === 'danger',
                  }
                )}
              ></span>
            ) : null}

            {label ? (
              <div
                className={cx(
                  'ui-relative ui-flex ui-items-center ui-justify-center',
                  'ui-rounded-full ui-border ui-border-white ',
                  'ui-h-5 ui-min-w-5 ui-text-nowrap ui-leading-none',
                  {
                    'ui-bg-primary-500': color === 'primary',
                    'ui-bg-secondary-500': color === 'secondary',
                    'ui-bg-success-500': color === 'success',
                    'ui-bg-info-500': color === 'info',
                    'ui-bg-warning-500': color === 'warning',
                    'ui-bg-danger-500': color === 'danger',
                  },
                  {
                    'ui-px-1': length === 2,
                    'ui-px-1.5': length > 2,
                  }
                )}
              >
                <div className="ui-translate-y-[-0.5px] ui-text-xs ui-leading-none ui-text-white">
                  {label}
                </div>
              </div>
            ) : (
              <div
                className={cx(
                  'ui-relative ui-flex ui-items-center ui-justify-center ui-px-1',
                  'ui-rounded-full ui-border ui-border-white ',
                  'ui-h-3.5 ui-w-3.5 ',
                  {
                    'ui-bg-primary-500': color === 'primary',
                    'ui-bg-secondary-500': color === 'secondary',
                    'ui-bg-success-500': color === 'success',
                    'ui-bg-info-500': color === 'info',
                    'ui-bg-warning-500': color === 'warning',
                    'ui-bg-danger-500': color === 'danger',
                  }
                )}
              ></div>
            )}
          </div>
        </span>
        {children}
      </div>
    </div>
  )
}
