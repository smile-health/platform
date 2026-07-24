'use client'

import React, { forwardRef } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { Spinner } from '#components/spinner'
import cx from '#lib/cx'

import { ButtonColor, ButtonVariant } from './button-types'

export type ButtonProps = React.ComponentProps<'button'> & {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** @default "solid" */
  variant?: ButtonVariant

  /** @default "primary" */
  color?: ButtonColor

  /** children */
  children?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode

  /** @default false */
  fullWidth?: boolean

  /** @default false */
  loading?: boolean

  /** @default false */
  disabled?: boolean

  /** @default false */
  asChild?: boolean

  className?: string
}

function variantStyles({
  variant,
  color,
}: {
  variant: ButtonVariant
  color: ButtonColor
}): object | string {  
  if (variant === 'solid') {
    return {
      'focus:ui-ring ui-text-primary-contrast focus:ui-ring-opacity-40': true,
      'ui-bg-primary-500 [&:not(disabled)]:hover:ui-bg-primary-600 enabled:active:ui-bg-primary-700 focus:ui-ring-primary-400':
        color === 'primary',
      'ui-bg-secondary-500 [&:not(disabled)]:hover:ui-bg-secondary-600 enabled:active:ui-bg-secondary-700 focus:ui-ring-secondary-400':
        color === 'secondary',
      'ui-bg-success-500 [&:not(disabled)]:hover:ui-bg-success-600 enabled:active:ui-bg-success-700 focus:ui-ring-success-400':
        color === 'success',
      'ui-bg-warning-500 [&:not(disabled)]:hover:ui-bg-warning-600 enabled:active:ui-bg-warning-700 focus:ui-ring-warning-400':
        color === 'warning',
      'ui-bg-info-500 [&:not(disabled)]:hover:ui-bg-info-600 enabled:active:ui-bg-info-700 focus:ui-ring-info-400':
        color === 'info',
      'ui-bg-danger-500 [&:not(disabled)]:hover:ui-bg-danger-600 enabled:active:ui-bg-danger-700 focus:ui-ring-danger-400':
        color === 'danger',
    }
  }

  if (variant === 'light') {
    return {
      'focus:ui-ring-2 focus:ui-ring-offset-2 focus:ui-ring-opacity-50': true,
      'ui-bg-primary-50 [&:not(disabled)]:hover:ui-bg-primary-100 enabled:active:ui-bg-primary-200 focus:ui-ring-primary-300 ui-text-primary-surface':
        color === 'primary',
      'ui-bg-secondary-50 [&:not(disabled)]:hover:ui-bg-secondary-100 enabled:active:ui-bg-secondary-200 focus:ui-ring-secondary-300 ui-text-primary-surface':
        color === 'secondary',
      'ui-bg-success-50 [&:not(disabled)]:hover:ui-bg-success-100 enabled:active:ui-bg-success-200 focus:ui-ring-success-300 ui-text-success-600':
        color === 'success',
      'ui-bg-warning-50 [&:not(disabled)]:hover:ui-bg-warning-100 enabled:active:ui-bg-warning-200 focus:ui-ring-warning-300 ui-text-warning-600':
        color === 'warning',
      'ui-bg-info-50 [&:not(disabled)]:hover:ui-bg-info-100 enabled:active:ui-bg-info-200 focus:ui-ring-info-300 ui-text-info-600':
        color === 'info',
      'ui-bg-danger-50 [&:not(disabled)]:hover:ui-bg-danger-100 enabled:active:ui-bg-danger-200 focus:ui-ring-danger-300 ui-text-danger-600':
        color === 'danger',
    }
  }

  if (variant === 'default') {
    return '[&:not(disabled)]:hover:ui-bg-gray-50 enabled:active:ui-bg-gray-100 ui-bg-white focus:ui-ring-2 focus:ui-border-primary-300 focus:ui-ring-primary-500 focus:ui-ring-opacity-25 ui-text-gray-700 ui-border ui-border-gray-300 ui-shadow-xs'
  }

  if (variant === 'outline') {
    return {
      'focus:ui-ring focus:ui-ring-opacity-40 ui-bg-white': true,
      '[&:not(disabled)]:hover:ui-bg-primary-50 enabled:active:ui-bg-primary-100 focus:ui-ring-primary-200 ui-text-primary-surface ui-border ui-border-primary-500':
        color === 'primary',
      '[&:not(disabled)]:hover:ui-bg-secondary-50 enabled:active:ui-bg-secondary-100 focus:ui-ring-secondary-200 ui-text-primary-surface ui-border ui-border-secondary-600':
        color === 'secondary',
      '[&:not(disabled)]:hover:ui-bg-success-50 enabled:active:ui-bg-success-100 focus:ui-ring-success-200 ui-text-success-600 ui-border ui-border-success-600':
        color === 'success',
      '[&:not(disabled)]:hover:ui-bg-warning-50 enabled:active:ui-bg-warning-100 focus:ui-ring-warning-200 ui-text-warning-600 ui-border ui-border-warning-600':
        color === 'warning',
      '[&:not(disabled)]:hover:ui-bg-info-50 enabled:active:ui-bg-info-100 focus:ui-ring-info-200 ui-text-info-600 ui-border ui-border-info-600':
        color === 'info',
      '[&:not(disabled)]:hover:ui-bg-danger-50 enabled:active:ui-bg-danger-100 focus:ui-ring-danger-200 ui-text-danger-600 ui-border ui-border-danger-600':
        color === 'danger',
    }
  }

  if (variant === 'subtle') {
    return {
      'focus:ui-ring-2 focus:ui-ring-offset-2 focus:ui-ring-opacity-40': true,
      '[&:not(disabled)]:hover:ui-bg-primary-50 enabled:active:ui-bg-primary-100 focus:ui-ring-primary-300 ui-text-primary-surface':
        color === 'primary',
      '[&:not(disabled)]:hover:ui-bg-secondary-50 enabled:active:ui-bg-secondary-100 focus:ui-ring-secondary-300 ui-text-primary-surface':
        color === 'secondary',
      '[&:not(disabled)]:hover:ui-bg-success-50 enabled:active:ui-bg-success-100 focus:ui-ring-success-300 ui-text-success-600':
        color === 'success',
      '[&:not(disabled)]:hover:ui-bg-warning-50 enabled:active:ui-bg-warning-100 focus:ui-ring-warning-300 ui-text-warning-600':
        color === 'warning',
      '[&:not(disabled)]:hover:ui-bg-info-50 enabled:active:ui-bg-info-100 focus:ui-ring-info-300 ui-text-info-600':
        color === 'info',
      '[&:not(disabled)]:hover:ui-bg-danger-50 enabled:active:ui-bg-danger-100 focus:ui-ring-danger-300 ui-text-danger-600':
        color === 'danger',
    }
  }

  return ''
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      size = 'md',
      variant = 'solid',
      color = 'primary',
      children,
      leftIcon,
      rightIcon,
      fullWidth = false,
      loading = false,
      disabled = false,
      asChild = false,
      className,
      ...props
    },
    ref
  ) {
    const Component = asChild ? Slot : 'button'

    const buttonStyle = cx(
      // base style
      'ui-inline-flex ui-items-center ui-justify-center ui-rounded ui-px-3 ui-font-medium focus:ui-outline-none',
      {
        'ui-cursor-not-allowed ui-opacity-50': disabled,
        'ui-cursor-not-allowed': loading,
        'ui-w-full': fullWidth,
      },
      variantStyles({ variant, color }),
      // size style
      {
        'ui-h-9 ui-text-sm': size === 'sm',
        'ui-h-10 ui-text-sm': size === 'md',
        'ui-h-12 ui-text-lg': size === 'lg',
        'ui-h-14 ui-text-xl': size === 'xl',
      },

      //button group
      'group-[.is-group]:focus:ui-z-10',
      'group-[.is-group]:first:!ui-rounded-r-none',
      'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!ui-rounded-none',
      'group-[.is-group]:last:!ui-rounded-l-none',

      'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!-ui-mr-[1px]',
      'group-[.is-group]:last:!-ui-ml-[1px]',
      'group-[.is-group]:first:!-ui-mr-[1px]',
      className
    )

    return (
      <Component
        {...props}
        ref={ref}
        disabled={disabled || loading}
        className={buttonStyle}
      >
        {loading ? (
          <Spinner
            className={cx('ui-mr-2', {
              'ui-h-4 ui-w-4': size === 'sm',
              'ui-h-5 ui-w-5': size === 'md',
              'ui-h-6 ui-w-6': size === 'lg',
              'ui-h-7 ui-w-7': size === 'xl',
            })}
          ></Spinner>
        ) : null}
        {leftIcon && !loading ? (
          <div className="ui-mr-2">{leftIcon}</div>
        ) : null}
        {children ? <Slottable>{children}</Slottable> : null}
        {rightIcon ? <div className="ui-ml-2">{rightIcon}</div> : null}
      </Component>
    )
  }
)

export function ButtonGroup({
  children,
  className,
}: Readonly<{
  children: React.ReactNode
  className?: string
}>) {
  return (
    <div className={`is-group ui-relative ui-flex group ${className}`}>
      {children}
    </div>
  )
}
