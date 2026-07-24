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
        'focus:ui-ring ui-text-primary-contrast focus:ui-ring-opacity-40': true,
        'ui-bg-primary-500 enabled:hover:ui-bg-primary-600 enabled:active:ui-bg-primary-700 focus:ui-ring-primary-400':
          color === 'primary',
        'ui-bg-secondary-500 enabled:hover:ui-bg-secondary-600 enabled:active:ui-bg-secondary-700 focus:ui-ring-secondary-400':
          color === 'secondary',
        'ui-bg-success-500 enabled:hover:ui-bg-success-600 enabled:active:ui-bg-success-700 focus:ui-ring-success-400':
          color === 'success',
        'ui-bg-warning-500 enabled:hover:ui-bg-warning-600 enabled:active:ui-bg-warning-700 focus:ui-ring-warning-400':
          color === 'warning',
        'ui-bg-info-500 enabled:hover:ui-bg-info-600 enabled:active:ui-bg-info-700 focus:ui-ring-info-400':
          color === 'info',
        'ui-bg-danger-500 enabled:hover:ui-bg-danger-600 enabled:active:ui-bg-danger-700 focus:ui-ring-danger-400':
          color === 'danger',
      }
    case 'light':
      return {
        'focus:ui-ring-2 focus:ui-ring-offset-1 focus:ui-ring-opacity-50': true,
        'ui-bg-primary-50 enabled:hover:ui-bg-primary-100 enabled:active:ui-bg-primary-200 focus:ui-ring-primary-300 ui-text-primary-surface':
          color === 'primary',
        'ui-bg-secondary-50 enabled:hover:ui-bg-secondary-100 enabled:active:ui-bg-secondary-200 focus:ui-ring-secondary-300 ui-text-primary-surface':
          color === 'secondary',
        'ui-bg-success-50 enabled:hover:ui-bg-success-100 enabled:active:ui-bg-success-200 focus:ui-ring-success-300 ui-text-success-600':
          color === 'success',
        'ui-bg-warning-50 enabled:hover:ui-bg-warning-100 enabled:active:ui-bg-warning-200 focus:ui-ring-warning-300 ui-text-warning-600':
          color === 'warning',
        'ui-bg-info-50 enabled:hover:ui-bg-info-100 enabled:active:ui-bg-info-200 focus:ui-ring-info-300 ui-text-info-600':
          color === 'info',
        'ui-bg-danger-50 enabled:hover:ui-bg-danger-100 enabled:active:ui-bg-danger-200 focus:ui-ring-danger-300 ui-text-danger-600':
          color === 'danger',
      }

    case 'default':
      return 'enabled:hover:ui-bg-gray-50 enabled:active:ui-bg-gray-100 ui-bg-white focus:ui-ring-2 focus:ui-border-primary-300 focus:ui-ring-primary-500 focus:ui-ring-opacity-25 ui-text-gray-700 ui-border ui-border-gray-300 ui-shadow-xs'
    case 'outline':
      return {
        'focus:ui-ring focus:ui-ring-opacity-40 ui-bg-white': true,
        'enabled:hover:ui-bg-primary-50 enabled:active:ui-bg-primary-100 focus:ui-ring-primary-200 ui-text-primary-surface ui-border ui-border-primary-600':
          color === 'primary',
        'enabled:hover:ui-bg-secondary-50 enabled:active:ui-bg-secondary-100 focus:ui-ring-secondary-200 ui-text-primary-surface ui-border ui-border-secondary-600':
          color === 'secondary',
        'enabled:hover:ui-bg-success-50 enabled:active:ui-bg-success-100 focus:ui-ring-success-200 ui-text-success-600 ui-border ui-border-success-600':
          color === 'success',
        'enabled:hover:ui-bg-warning-50 enabled:active:ui-bg-warning-100 focus:ui-ring-warning-200 ui-text-warning-600 ui-border ui-border-warning-600':
          color === 'warning',
        'enabled:hover:ui-bg-info-50 enabled:active:ui-bg-info-100 focus:ui-ring-info-200 ui-text-info-600 ui-border ui-border-info-600':
          color === 'info',
        'enabled:hover:ui-bg-danger-50 enabled:active:ui-bg-danger-100 focus:ui-ring-danger-200 ui-text-danger-600 ui-border ui-border-danger-600':
          color === 'danger',
      }
    case 'subtle':
      return {
        'focus:ui-ring-2 focus:ui-ring-offset-1 focus:ui-ring-opacity-40': true,
        'enabled:hover:ui-bg-primary-50 enabled:active:ui-bg-primary-100 focus:ui-ring-primary-300 ui-text-primary-surface':
          color === 'primary',
        'enabled:hover:ui-bg-secondary-50 enabled:active:ui-bg-secondary-100 focus:ui-ring-secondary-300 ui-text-primary-surface':
          color === 'secondary',
        'enabled:hover:ui-bg-success-50 enabled:active:ui-bg-success-100 focus:ui-ring-success-300 ui-text-success-600':
          color === 'success',
        'enabled:hover:ui-bg-warning-50 enabled:active:ui-bg-warning-100 focus:ui-ring-warning-300 ui-text-warning-600':
          color === 'warning',
        'enabled:hover:ui-bg-info-50 enabled:active:ui-bg-info-100 focus:ui-ring-info-300 ui-text-info-600':
          color === 'info',
        'enabled:hover:ui-bg-danger-50 enabled:active:ui-bg-danger-100 focus:ui-ring-danger-300 ui-text-danger-600':
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
      'ui-flex ui-h-full ui-items-center ui-justify-center ui-rounded ui-font-medium ui-leading-none focus:ui-outline-none',
      {
        'ui-cursor-not-allowed ui-opacity-50': disabled,
        'ui-cursor-not-allowed': loading,
      },
      variantStyles({ variant, color }),
      // size style
      {
        'ui-h-6 ui-w-6 ui-text-sm': size === 'sm',
        'ui-h-8 ui-w-8 ui-text-base': size === 'md',
        'ui-h-10 ui-w-10 ui-text-lg': size === 'lg',
        'ui-h-12 ui-w-12 ui-text-xl': size === 'xl',
      },

      //button group
      'group-[.is-group]:focus:ui-z-10',
      'group-[.is-group]:first:!ui-rounded-r-none',
      'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!ui-rounded-none',
      'group-[.is-group]:last:!ui-rounded-l-none',

      'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!ui-border-l-0',
      'group-[.is-group]:last:!ui-border-l-0',
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
                  'ui-h-4 ui-w-4': size === 'sm',
                  'ui-h-5 ui-w-5': size === 'md',
                  'ui-h-6 ui-w-6': size === 'lg',
                  'ui-h-7 ui-w-7': size === 'xl',
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
