'use client'

import React, { forwardRef } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import cx from '#lib/cx'
import { Color } from '#types/component'

export type BadgeVariant = 'solid' | 'light' | 'light-outline' | 'outline'

export type BadgeColor = Color

function variantStyles({
  variant,
  color,
}: {
  variant: BadgeVariant
  color: BadgeColor
}): object | string {
  switch (variant) {
    case 'solid':
      return {
        'ui-bg-primary-500 ui-text-primary-contrast': color === 'primary',
        'ui-bg-secondary-500 ui-text-white': color === 'secondary',
        'ui-bg-success-500 ui-text-white': color === 'success',
        'ui-bg-warning-500 ui-text-white': color === 'warning',
        'ui-bg-info-500 ui-text-white': color === 'info',
        'ui-bg-danger-500 ui-text-white': color === 'danger',
        'ui-bg-gray-500 ui-text-white': color === 'neutral',
      }
    case 'light':
      return {
        'ui-bg-primary-50 ui-text-primary-surface': color === 'primary',
        'ui-bg-secondary-50 ui-text-secondary-500': color === 'secondary',
        'ui-bg-success-50 ui-text-success-500': color === 'success',
        'ui-bg-warning-50 ui-text-warning-500': color === 'warning',
        'ui-bg-info-50 ui-text-info-500': color === 'info',
        'ui-bg-danger-50 ui-text-danger-500': color === 'danger',
        'ui-bg-gray-50 ui-text-gray-500': color === 'neutral',
      }
    case 'light-outline':
      return {
        'ui-text-primary-600 ui-bg-primary-50 ui-border ui-text-primary-surface':
          color === 'primary',
        'ui-text-secondary-600 ui-bg-secondary-50 ui-border ui-border-secondary-300':
          color === 'secondary',
        'ui-text-success-600 ui-bg-success-50 ui-border ui-border-success-300':
          color === 'success',
        'ui-text-warning-600 ui-bg-warning-50 ui-border ui-border-warning-300':
          color === 'warning',
        'ui-text-info-600 ui-bg-info-50 ui-border ui-border-info-300':
          color === 'info',
        'ui-text-danger-600 ui-bg-danger-50 ui-border ui-border-danger-300':
          color === 'danger',
        'ui-text-gray-600 ui-bg-neutral-50 ui-border ui-border-gray-300':
          color === 'neutral',
      }
    case 'outline':
      return {
        'ui-text-primary-surface ui-border ui-border-primary-600':
          color === 'primary',
        'ui-text-secondary-600 ui-border ui-border-secondary-600':
          color === 'secondary',
        'ui-text-success-600 ui-border ui-border-success-600':
          color === 'success',
        'ui-text-warning-600 ui-border ui-border-warning-600':
          color === 'warning',
        'ui-text-info-600 ui-border ui-border-info-600': color === 'info',
        'ui-text-danger-600 ui-border ui-border-danger-600': color === 'danger',
        'ui-text-gray-600 ui-border ui-border-gray-600': color === 'neutral',
      }
    default:
      return ''
  }
}

function dotStyles({
  variant,
  color,
}: {
  variant: BadgeVariant
  color: BadgeColor
}): object | string {
  switch (variant) {
    case 'solid':
      return {
        'ui-bg-white': true,
      }
    case 'light':
      return {
        'ui-bg-primary-400': color === 'primary',
        'ui-bg-secondary-400': color === 'secondary',
        'ui-bg-success-400': color === 'success',
        'ui-bg-warning-400': color === 'warning',
        'ui-bg-info-400': color === 'info',
        'ui-bg-danger-400': color === 'danger',
        'ui-bg-gray-400': color === 'neutral',
      }
    case 'outline':
    case 'light-outline':
      return {
        'ui-bg-primary-500': color === 'primary',
        'ui-bg-secondary-500': color === 'secondary',
        'ui-bg-success-500': color === 'success',
        'ui-bg-warning-500': color === 'warning',
        'ui-bg-info-500': color === 'info',
        'ui-bg-danger-500': color === 'danger',
        'ui-bg-gray-500': color === 'neutral',
      }
    default:
      return ''
  }
}

type BadgeProps = React.ComponentPropsWithoutRef<'span'> & {
  /** @default "md" */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  /** @default "md" */
  rounded?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'none'

  /** @default "solid" */
  variant?: BadgeVariant

  /** @default "primary" */
  color?: BadgeColor

  children?: React.ReactNode
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode

  /** @default false */
  fullWidth?: boolean

  /** @default false */
  withDot?: boolean

  /** @default false */
  asChild?: boolean
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      asChild,
      size = 'sm',
      variant = 'solid',
      color = 'primary',
      children,
      fullWidth = false,
      withDot = false,
      leftSection,
      rightSection,
      rounded = 'sm',
      className,
      ...props
    },
    ref
  ) => {
    const Component = asChild ? Slot : 'span'

    return (
      <Component
        {...props}
        className={cx(
          `ui-box-border ui-inline-flex ui-h-fit ui-items-center ui-justify-center ui-whitespace-nowrap focus:ui-outline-none`,
          variantStyles({ variant, color }),
          {
            'ui-rounded-none': rounded === 'none',
            'ui-rounded-sm': rounded === 'xs',
            'ui-rounded': rounded === 'sm',
            'ui-rounded-md': rounded === 'md',
            'ui-rounded-lg': rounded === 'lg',
            'ui-rounded-xl': rounded === 'xl',
            'ui-rounded-full': rounded === 'full',
          },
          {
            'ui-px-2 ui-py-1 ui-text-xs': size === 'xs',
            'ui-px-2.5 ui-py-1 ui-text-sm': size === 'sm',
            'ui-px-3 ui-py-1 ui-text-base': size === 'md',
            'ui-px-4 ui-py-1.5 ui-text-lg': size === 'lg',
            'ui-px-5 ui-py-2 ui-text-xl': size === 'xl',
          },
          {
            'ui-w-full': fullWidth,
          },
          'ui-leading-none',
          className
        )}
        ref={ref}
      >
        {withDot ? (
          <div
            className={cx(
              'ui-mr-1.5 ui-rounded-full',
              'ui-h-1.5 ui-w-1.5',
              dotStyles({ variant, color })
            )}
          ></div>
        ) : null}
        {leftSection || null}
        <Slottable>{children}</Slottable>
        {rightSection || null}
      </Component>
    )
  }
)

Badge.displayName = 'Badge'
