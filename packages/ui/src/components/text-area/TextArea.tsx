'use client'

import cx from "#lib/cx";
import React from "react";

export type TextAreaProps = Omit<React.ComponentProps<'textarea'>, 'size'> & {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** @default "solid" */
  variant?: 'filled' | 'outline'

  children?: React.ReactNode
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode

  /** @default false */
  error?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    { error, disabled, size = 'md', variant = 'outline', rows = 4, ...props },
    ref
  ) {
    return (
      <textarea
        {...props}
        data-error={error}
        ref={ref}
        disabled={disabled}
        rows={rows}
        className={cx(
          // base style
          'ui-form-textarea ui-w-full ui-rounded ui-text-gray-800',
          'focus:ui-border-primary-500 focus:ui-outline-none focus:ui-ring-primary-500 focus:ui-ring-opacity-25',
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
            'ui-text-sm': size === 'sm',
            'ui-text-base': size === 'md',
            'ui-text-lg': size === 'lg',
            'ui-text-xl': size === 'xl',
          },
          props.className
        )}
      />
    )
  }
)
