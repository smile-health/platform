'use client'

import React from 'react'
import cx from '#lib/cx'

export type CheckboxProps = Omit<
  React.ComponentPropsWithRef<'input'>,
  'type' | 'size'
> & {
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl'

  /** @default false */
  indeterminate?: boolean

  label?: string | React.ReactNode
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      size = 'sm',
      checked,
      defaultChecked,
      onChange,
      indeterminate = false,
      disabled = false,
      name,
      label,
      className,
      ...props
    },
    ref
  ) {
    const id = React.useId()

    const iconStyle = cx(
      'ui-pointer-events-none ui-absolute ui-inset-0 ui-m-auto',
      'ui-opacity-0',
      {
        'ui-text-white peer-checked:ui-opacity-100': !disabled,
        'ui-text-gray-600 peer-checked:ui-opacity-50': disabled,
      },
      {
        'ui-h-3 ui-w-3': size === 'sm',
        'ui-h-3.5 ui-w-3.5': size === 'md',
        'ui-h-4 ui-w-4': size === 'lg',
        'ui-h-5 ui-w-5': size === 'xl',
      }
    )
    return (
      <div className="ui-inline-flex ui-items-center ui-space-x-3">
        <div className="ui-relative ui-leading-[0]">
          <input
            {...props}
            ref={ref}
            name={name}
            checked={checked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={onChange}
            className={cx(
              'ui-shadow-xs ui-peer ui-form-checkbox ui-appearance-none ui-rounded !ui-bg-none',
              'ui-border-2 ui-border-gray-300 focus:ui-ring-2 focus:!ui-ring-primary-500 focus:!ui-ring-opacity-40',
              'disabled:ui-text-gray-200 disabled:checked:ui-border-gray-300',
              'ui-bg-white checked:ui-border-current checked:ui-bg-current',
              'ui-text-primary-surface',
              disabled ? 'ui-cursor-not-allowed' : 'ui-cursor-pointer',
              {
                'ui-h-5 ui-w-5': size === 'sm',
                'ui-h-6 ui-w-6': size === 'md',
                'ui-h-7 ui-w-7': size === 'lg',
                'ui-h-8 ui-w-8': size === 'xl',
              },
              className
            )}
            id={id}
            type="checkbox"
          ></input>

          {indeterminate ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 32 6"
              className={iconStyle}
            >
              <rect width="32" height="6" fill="currentColor" rx="3"></rect>
            </svg>
          ) : (
            <svg
              viewBox="0 0 10 7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={iconStyle}
            >
              <path
                d="M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </div>

        {label ? (
          <div>
            <label
              className={cx(
                'ui-leading-tight ui-text-gray-700',
                {
                  'ui-text-sm': size === 'sm',
                  'ui-text-base': size === 'md',
                  'ui-text-lg': size === 'lg',
                  'ui-text-xl': size === 'xl',
                },
                {
                  'ui-cursor-not-allowed ui-text-gray-400': disabled,
                }
              )}
              htmlFor={id}
            >
              {label}
            </label>
          </div>
        ) : null}
      </div>
    )
  }
)
