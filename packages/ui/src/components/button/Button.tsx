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
      'ui:focus:ring-3 ui:text-primary-contrast': true,
      'ui:bg-primary-500 ui:[&:not(disabled)]:hover:bg-primary-600 ui:enabled:active:bg-primary-700 ui:focus:ring-primary-400/40':
        color === 'primary',
      'ui:bg-secondary-500 ui:[&:not(disabled)]:hover:bg-secondary-600 ui:enabled:active:bg-secondary-700 ui:focus:ring-secondary-400/40':
        color === 'secondary',
      'ui:bg-success-500 ui:[&:not(disabled)]:hover:bg-success-600 ui:enabled:active:bg-success-700 ui:focus:ring-success-400/40':
        color === 'success',
      'ui:bg-warning-500 ui:[&:not(disabled)]:hover:bg-warning-600 ui:enabled:active:bg-warning-700 ui:focus:ring-warning-400/40':
        color === 'warning',
      'ui:bg-info-500 ui:[&:not(disabled)]:hover:bg-info-600 ui:enabled:active:bg-info-700 ui:focus:ring-info-400/40':
        color === 'info',
      'ui:bg-danger-500 ui:[&:not(disabled)]:hover:bg-danger-600 ui:enabled:active:bg-danger-700 ui:focus:ring-danger-400/40':
        color === 'danger',
    }
  }

  if (variant === 'light') {
    return {
      'ui:focus:ring-2 ui:focus:ring-offset-2': true,
      'ui:bg-primary-50 ui:[&:not(disabled)]:hover:bg-primary-100 ui:enabled:active:bg-primary-200 ui:focus:ring-primary-300/50 ui:text-primary-surface':
        color === 'primary',
      'ui:bg-secondary-50 ui:[&:not(disabled)]:hover:bg-secondary-100 ui:enabled:active:bg-secondary-200 ui:focus:ring-secondary-300/50 ui:text-primary-surface':
        color === 'secondary',
      'ui:bg-success-50 ui:[&:not(disabled)]:hover:bg-success-100 ui:enabled:active:bg-success-200 ui:focus:ring-success-300/50 ui:text-success-600':
        color === 'success',
      'ui:bg-warning-50 ui:[&:not(disabled)]:hover:bg-warning-100 ui:enabled:active:bg-warning-200 ui:focus:ring-warning-300/50 ui:text-warning-600':
        color === 'warning',
      'ui:bg-info-50 ui:[&:not(disabled)]:hover:bg-info-100 ui:enabled:active:bg-info-200 ui:focus:ring-info-300/50 ui:text-info-600':
        color === 'info',
      'ui:bg-danger-50 ui:[&:not(disabled)]:hover:bg-danger-100 ui:enabled:active:bg-danger-200 ui:focus:ring-danger-300/50 ui:text-danger-600':
        color === 'danger',
    }
  }

  if (variant === 'default') {
    return 'ui:[&:not(disabled)]:hover:bg-gray-50 ui:enabled:active:bg-gray-100 ui:bg-white ui:focus:ring-2 ui:focus:border-primary-300 ui:focus:ring-primary-500/25 ui:text-gray-700 ui:border ui:border-gray-300 ui:shadow-xs'
  }

  if (variant === 'outline') {
    return {
      'ui:focus:ring-3 ui:bg-white': true,
      'ui:[&:not(disabled)]:hover:bg-primary-50 ui:enabled:active:bg-primary-100 ui:focus:ring-primary-200/40 ui:text-primary-surface ui:border ui:border-primary-500':
        color === 'primary',
      'ui:[&:not(disabled)]:hover:bg-secondary-50 ui:enabled:active:bg-secondary-100 ui:focus:ring-secondary-200/40 ui:text-primary-surface ui:border ui:border-secondary-600':
        color === 'secondary',
      'ui:[&:not(disabled)]:hover:bg-success-50 ui:enabled:active:bg-success-100 ui:focus:ring-success-200/40 ui:text-success-600 ui:border ui:border-success-600':
        color === 'success',
      'ui:[&:not(disabled)]:hover:bg-warning-50 ui:enabled:active:bg-warning-100 ui:focus:ring-warning-200/40 ui:text-warning-600 ui:border ui:border-warning-600':
        color === 'warning',
      'ui:[&:not(disabled)]:hover:bg-info-50 ui:enabled:active:bg-info-100 ui:focus:ring-info-200/40 ui:text-info-600 ui:border ui:border-info-600':
        color === 'info',
      'ui:[&:not(disabled)]:hover:bg-danger-50 ui:enabled:active:bg-danger-100 ui:focus:ring-danger-200/40 ui:text-danger-600 ui:border ui:border-danger-600':
        color === 'danger',
    }
  }

  if (variant === 'subtle') {
    return {
      'ui:focus:ring-2 ui:focus:ring-offset-2': true,
      'ui:[&:not(disabled)]:hover:bg-primary-50 ui:enabled:active:bg-primary-100 ui:focus:ring-primary-300/40 ui:text-primary-surface':
        color === 'primary',
      'ui:[&:not(disabled)]:hover:bg-secondary-50 ui:enabled:active:bg-secondary-100 ui:focus:ring-secondary-300/40 ui:text-primary-surface':
        color === 'secondary',
      'ui:[&:not(disabled)]:hover:bg-success-50 ui:enabled:active:bg-success-100 ui:focus:ring-success-300/40 ui:text-success-600':
        color === 'success',
      'ui:[&:not(disabled)]:hover:bg-warning-50 ui:enabled:active:bg-warning-100 ui:focus:ring-warning-300/40 ui:text-warning-600':
        color === 'warning',
      'ui:[&:not(disabled)]:hover:bg-info-50 ui:enabled:active:bg-info-100 ui:focus:ring-info-300/40 ui:text-info-600':
        color === 'info',
      'ui:[&:not(disabled)]:hover:bg-danger-50 ui:enabled:active:bg-danger-100 ui:focus:ring-danger-300/40 ui:text-danger-600':
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
      'ui:inline-flex ui:items-center ui:justify-center ui:rounded ui:px-3 ui:font-medium ui:focus:outline-hidden',
      {
        'ui:cursor-not-allowed ui:opacity-50': disabled,
        'ui:cursor-not-allowed': loading,
        'ui:w-full': fullWidth,
      },
      variantStyles({ variant, color }),
      // size style
      {
        'ui:h-9 ui:text-sm': size === 'sm',
        'ui:h-10 ui:text-sm': size === 'md',
        'ui:h-12 ui:text-lg': size === 'lg',
        'ui:h-14 ui:text-xl': size === 'xl',
      },

      //button group
      'ui:focus:group-[.is-group]:z-10',
      'ui:first:group-[.is-group]:rounded-r-none!',
      'ui:[&:not(:first-child):not(:last-child)]:group-[.is-group]:rounded-none!',
      'ui:last:group-[.is-group]:rounded-l-none!',

      'ui:[&:not(:first-child):not(:last-child)]:group-[.is-group]:-mr-px!',
      'ui:last:group-[.is-group]:-ml-px!',
      'ui:first:group-[.is-group]:-mr-px!',
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
            className={cx('ui:mr-2', {
              'ui:h-4 ui:w-4': size === 'sm',
              'ui:h-5 ui:w-5': size === 'md',
              'ui:h-6 ui:w-6': size === 'lg',
              'ui:h-7 ui:w-7': size === 'xl',
            })}
          ></Spinner>
        ) : null}
        {leftIcon && !loading ? (
          <div className="ui:mr-2">{leftIcon}</div>
        ) : null}
        {children ? <Slottable>{children}</Slottable> : null}
        {rightIcon ? <div className="ui:ml-2">{rightIcon}</div> : null}
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
    <div className={`is-group ui:relative ui:flex group ${className}`}>
      {children}
    </div>
  )
}
