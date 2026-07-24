'use client'

import React, { useContext } from 'react'
import { InputGroupCtx } from '#components/input'
import cx from '#lib/cx'

export type NativeSelectVariant = 'filled' | 'outline'

export type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** @default "outline" */
  variant?: NativeSelectVariant

  children?: React.ReactNode
  leftIcon?: React.ReactNode

  /** @default false */
  fullWidth?: boolean

  /** @default false */
  disabled?: boolean

  /** @default false */
  error?: boolean
}

function DefaultContainer({
  children,
  fullWidth,
}: Readonly<{
  children: React.ReactNode
  fullWidth?: boolean
}>) {
  return (
    <div
      className={cx('ui-relative ui-flex', {
        'ui-w-full': fullWidth,
      })}
    >
      {children}
    </div>
  )
}

export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  NativeSelectProps
>(function NativeSelect(
  {
    error,
    disabled,
    leftIcon,
    size = 'md',
    variant = 'outline',
    children,
    fullWidth,
    ...props
  },
  ref
) {
  const isGroup = useContext(InputGroupCtx)
  const Root = isGroup ? React.Fragment : DefaultContainer

  return (
    <Root fullWidth={isGroup ? fullWidth : undefined}>
      {leftIcon ? (
        <div className="ui-leading-1 ui-absolute ui-left-0 ui-top-0 ui-z-20 ui-flex ui-h-full ui-items-center ui-justify-center ui-px-2 ui-text-gray-700">
          <div>{leftIcon}</div>
        </div>
      ) : null}

      <select
        {...props}
        data-error={error}
        ref={ref}
        disabled={disabled}
        className={cx(
          // base style
          'ui-form-select ui-rounded ui-pr-10 ui-leading-tight ui-text-gray-800',
          '!ui-py-0 focus:ui-border-primary-500 focus:ui-outline-none focus:ui-ring-primary-500 focus:ui-ring-opacity-25',

          {
            //disable w-full when is group
            'ui-w-full': fullWidth,
          },
          // variant style
          {
            'ui-border-0 ui-bg-gray-100 focus:ui-border focus:ui-ring-2':
              variant === 'filled',
            'ui-bg-white-100 ui-border ui-border-gray-300 focus:ui-ring-2':
              variant === 'outline',

            'ui-cursor-not-allowed ui-bg-gray-100 ui-opacity-75': disabled,
          },
          'data-[error=true]:ui-border data-[error=true]:ui-border-danger-500 data-[error=true]:focus:ui-ring-danger-500 data-[error=true]:focus:ui-ring-opacity-25',
          //size style
          {
            'ui-h-8 ui-text-sm': size === 'sm',
            'ui-h-10 ui-text-base': size === 'md',
            'ui-h-12 ui-text-lg': size === 'lg',
            'ui-h-14 ui-text-xl': size === 'xl',
          },
          {
            //add padding to left side when leftIcon is true

            'ui-pl-8': size === 'sm' && leftIcon,
            'ui-pl-9': size === 'md' && leftIcon,
            'ui-pl-10': size === 'lg' && leftIcon,
            'ui-pl-11': size === 'xl' && leftIcon,
          },

          // group
          'group-[.is-group]:focus:ui-z-10',
          'group-[.is-group]:first:!ui-rounded-r-none',
          'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!ui-rounded-none',
          'group-[.is-group]:last:!ui-rounded-l-none',

          'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!-ui-mr-[1px]',
          'group-[.is-group]:last:!-ui-ml-[1px]',
          'group-[.is-group]:first:!-ui-mr-[1px]'
        )}
      >
        {children}
      </select>
    </Root>
  )
})
