'use client'

import React, { forwardRef } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { Spinner } from '#components/spinner'
import cx from '#lib/cx'

export type ButtonIconVariant =
  | 'solid'
  | 'light'
  | 'default'
  | 'outline'
  | 'subtle'
export type ButtonIconColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info'
  | 'danger'

type ButtonProps = React.ComponentProps<'button'> & {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** @default "solid" */
  variant?: 'solid' | 'light' | 'default' | 'outline' | 'subtle'

  /** @default "primary" */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'

  children?: React.ReactNode

  /** @default false */
  loading?: boolean

  /** @default false */
  disabled?: boolean

  /** @default false */
  asChild?: boolean
}

function variantStyles({
  variant,
  color,
}: {
  variant: ButtonIconVariant
  color: ButtonIconColor
}): object | string {
  switch (variant) {
    case 'solid':
      return {
        'ui:focus:ring-3 ui:text-primary-contrast': true,
        'ui:bg-primary-500 ui:enabled:hover:bg-primary-600 ui:enabled:active:bg-primary-700 ui:focus:ring-primary-400/40':
          color === 'primary',
        'ui:bg-secondary-500 ui:enabled:hover:bg-secondary-600 ui:enabled:active:bg-secondary-700 ui:focus:ring-secondary-400/40':
          color === 'secondary',
        'ui:bg-success-500 ui:enabled:hover:bg-success-600 ui:enabled:active:bg-success-700 ui:focus:ring-success-400/40':
          color === 'success',
        'ui:bg-warning-500 ui:enabled:hover:bg-warning-600 ui:enabled:active:bg-warning-700 ui:focus:ring-warning-400/40':
          color === 'warning',
        'ui:bg-info-500 ui:enabled:hover:bg-info-600 ui:enabled:active:bg-info-700 ui:focus:ring-info-400/40':
          color === 'info',
        'ui:bg-danger-500 ui:enabled:hover:bg-danger-600 ui:enabled:active:bg-danger-700 ui:focus:ring-danger-400/40':
          color === 'danger',
      }
    case 'light':
      return {
        'ui:focus:ring-2 ui:focus:ring-offset-1': true,
        'ui:bg-primary-50 ui:enabled:hover:bg-primary-100 ui:enabled:active:bg-primary-200 ui:focus:ring-primary-300/50 ui:text-primary-surface':
          color === 'primary',
        'ui:bg-secondary-50 ui:enabled:hover:bg-secondary-100 ui:enabled:active:bg-secondary-200 ui:focus:ring-secondary-300/50 ui:text-primary-surface':
          color === 'secondary',
        'ui:bg-success-50 ui:enabled:hover:bg-success-100 ui:enabled:active:bg-success-200 ui:focus:ring-success-300/50 ui:text-success-600':
          color === 'success',
        'ui:bg-warning-50 ui:enabled:hover:bg-warning-100 ui:enabled:active:bg-warning-200 ui:focus:ring-warning-300/50 ui:text-warning-600':
          color === 'warning',
        'ui:bg-info-50 ui:enabled:hover:bg-info-100 ui:enabled:active:bg-info-200 ui:focus:ring-info-300/50 ui:text-info-600':
          color === 'info',
        'ui:bg-danger-50 ui:enabled:hover:bg-danger-100 ui:enabled:active:bg-danger-200 ui:focus:ring-danger-300/50 ui:text-danger-600':
          color === 'danger',
      }

    case 'default':
      return 'ui:enabled:hover:bg-gray-50 ui:enabled:active:bg-gray-100 ui:bg-white ui:focus:ring-2 ui:focus:border-primary-300 ui:focus:ring-primary-500/25 ui:text-gray-700 ui:border ui:border-gray-300 ui:shadow-xs'
    case 'outline':
      return {
        'ui:focus:ring-3 ui:bg-white': true,
        'ui:enabled:hover:bg-primary-50 ui:enabled:active:bg-primary-100 ui:focus:ring-primary-200/40 ui:text-primary-surface ui:border ui:border-primary-600':
          color === 'primary',
        'ui:enabled:hover:bg-secondary-50 ui:enabled:active:bg-secondary-100 ui:focus:ring-secondary-200/40 ui:text-primary-surface ui:border ui:border-secondary-600':
          color === 'secondary',
        'ui:enabled:hover:bg-success-50 ui:enabled:active:bg-success-100 ui:focus:ring-success-200/40 ui:text-success-600 ui:border ui:border-success-600':
          color === 'success',
        'ui:enabled:hover:bg-warning-50 ui:enabled:active:bg-warning-100 ui:focus:ring-warning-200/40 ui:text-warning-600 ui:border ui:border-warning-600':
          color === 'warning',
        'ui:enabled:hover:bg-info-50 ui:enabled:active:bg-info-100 ui:focus:ring-info-200/40 ui:text-info-600 ui:border ui:border-info-600':
          color === 'info',
        'ui:enabled:hover:bg-danger-50 ui:enabled:active:bg-danger-100 ui:focus:ring-danger-200/40 ui:text-danger-600 ui:border ui:border-danger-600':
          color === 'danger',
      }
    case 'subtle':
      return {
        'ui:focus:ring-2 ui:focus:ring-offset-1': true,
        'ui:enabled:hover:bg-primary-50 ui:enabled:active:bg-primary-100 ui:focus:ring-primary-300/40 ui:text-primary-surface':
          color === 'primary',
        'ui:enabled:hover:bg-secondary-50 ui:enabled:active:bg-secondary-100 ui:focus:ring-secondary-300/40 ui:text-primary-surface':
          color === 'secondary',
        'ui:enabled:hover:bg-success-50 ui:enabled:active:bg-success-100 ui:focus:ring-success-300/40 ui:text-success-600':
          color === 'success',
        'ui:enabled:hover:bg-warning-50 ui:enabled:active:bg-warning-100 ui:focus:ring-warning-300/40 ui:text-warning-600':
          color === 'warning',
        'ui:enabled:hover:bg-info-50 ui:enabled:active:bg-info-100 ui:focus:ring-info-300/40 ui:text-info-600':
          color === 'info',
        'ui:enabled:hover:bg-danger-50 ui:enabled:active:bg-danger-100 ui:focus:ring-danger-300/40 ui:text-danger-600':
          color === 'danger',
      }
    default:
      return ''
  }
}

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      size = 'md',
      variant = 'solid',
      color = 'primary',
      children,
      loading = false,
      disabled = false,
      className,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : 'button'

    const buttonStyle = cx(
      // base style
      'ui:flex ui:h-full ui:items-center ui:justify-center ui:rounded ui:font-medium ui:leading-none ui:focus:outline-hidden',
      {
        'ui:cursor-not-allowed ui:opacity-50': disabled,
        'ui:cursor-not-allowed': loading,
      },
      variantStyles({ variant, color }),
      // size style
      {
        'ui:h-6 ui:w-6 ui:text-sm': size === 'sm',
        'ui:h-8 ui:w-8 ui:text-base': size === 'md',
        'ui:h-10 ui:w-10 ui:text-lg': size === 'lg',
        'ui:h-12 ui:w-12 ui:text-xl': size === 'xl',
      },

      //button group
      'ui:focus:group-[.is-group]:z-10',
      'ui:first:group-[.is-group]:rounded-r-none!',
      'ui:[&:not(:first-child):not(:last-child)]:group-[.is-group]:rounded-none!',
      'ui:last:group-[.is-group]:rounded-l-none!',

      'ui:[&:not(:first-child):not(:last-child)]:group-[.is-group]:border-l-0!',
      'ui:last:group-[.is-group]:border-l-0!',
      className
    )

    return (
      <Component
        {...props}
        ref={ref}
        disabled={disabled || loading}
        className={buttonStyle}
      >
        <Slottable>
          {loading ? (
            <div>
              <Spinner
                className={cx({
                  'ui:h-4 ui:w-4': size === 'sm',
                  'ui:h-5 ui:w-5': size === 'md',
                  'ui:h-6 ui:w-6': size === 'lg',
                  'ui:h-7 ui:w-7': size === 'xl',
                })}
              ></Spinner>
            </div>
          ) : (
            children
          )}
        </Slottable>
      </Component>
    )
  }
)

ButtonIcon.displayName = 'ButtonIcon'
