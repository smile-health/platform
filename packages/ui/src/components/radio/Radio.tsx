'use client'

import React from 'react'
import cx from '#lib/cx'
import clsx from 'clsx'

export type RadioProps = Omit<
  React.ComponentPropsWithRef<'input'>,
  'type' | 'size'
> & {
  /** @default "sm" */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  label?: string
  align?: 'left' | 'center' | 'right'
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(
    {
      size = 'sm',
      disabled,
      label,
      name,
      value,
      checked,
      defaultChecked,
      onChange,
      align = 'center',
      ...props
    },
    ref
  ) {
    return (
      <label
        className={cx(
          'ui-relative ui-flex ui-items-center ui-space-x-2 ui-leading-tight ui-accent-primary-500 ui-cursor-pointer',
          {
            'ui-justify-start': align === 'left',
            'ui-justify-center': align === 'center',
            'ui-justify-end': align === 'right',
          }
        )}
      >
        <input
          {...props}
          ref={ref}
          name={name}
          value={value}
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          className={cx(
            'ui-form-radio ui-border-2 ui-border-gray-300',
            'ui-text-primary-500 focus:ui-ring-primary-500 focus:ui-ring-opacity-40',
            {
              'ui-cursor-not-allowed ui-bg-gray-100 checked:ui-opacity-50':
                disabled,
            },
            {
              'ui-h-4 ui-w-4': size === 'xs',
              'ui-h-5 ui-w-5': size === 'sm',
              'ui-h-6 ui-w-6': size === 'md',
              'ui-h-7 ui-w-7': size === 'lg',
              'ui-h-8 ui-w-8': size === 'xl',
            }
          )}
          type="radio"
        ></input>

        <span
          className={cx(
            'ui-leading-tight ui-text-gray-700',
            {
              'ui-text-xs': size === 'xs',
              'ui-text-sm': size === 'sm',
              'ui-text-base': size === 'md',
              'ui-text-lg': size === 'lg',
              'ui-text-xl': size === 'xl',
            },
            {
              'ui-cursor-not-allowed ui-text-gray-600': disabled,
            }
          )}
        >
          {label}
        </span>
      </label>
    )
  }
)

export function RadioGroup({
  className,
  children,
}: Readonly<{
  className?: string
  children: React.ReactNode
}>) {
  return (
    <div className={clsx('ui-flex ui-space-x-3', className)}>{children}</div>
  )
}
