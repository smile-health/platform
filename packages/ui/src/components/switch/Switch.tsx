'use client'

import React, { ReactNode } from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import cx from '#lib/cx'
import { motion } from 'framer-motion'

type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
> & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  labelInside?: {
    on: ReactNode
    off: ReactNode
  } | null
  onHandleClick?: (e: React.SyntheticEvent) => void
  colorInside?: {
    on: string
    off: string
  }
}

export const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(function Switch(
  {
    size = 'md',
    defaultChecked,
    checked,
    onCheckedChange,
    onHandleClick,
    disabled,
    required,
    name,
    value,
    label,
    labelInside,
    colorInside,
    ...props
  },
  ref
) {
  const id = React.useId()
  return (
    <div className="ui-inline-flex ui-items-center ui-space-x-3">
      <SwitchPrimitive.Root
        {...props}
        ref={ref}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={onCheckedChange}
        onClick={onHandleClick}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        className={cx(
          'ui-relative ui-rounded-full ui-shadow-inner',
          'focus:ui-outline-none focus:ui-ring-2',
          "ui-flex ui-items-center ui-gap-2 data-[state='unchecked']:ui-justify-start data-[state='checked']:ui-justify-end data-[state=unchecked]:ui-bg-gray-300",
          {
            'ui-cursor-not-allowed ui-opacity-50': disabled,
          },
          {
            'ui-h-[20px] ui-w-[36px] ui-px-[2.5px]': size === 'sm',
            'ui-h-[24px] ui-w-[44px] ui-px-[3px]': size === 'md',
            'ui-h-[29px] ui-w-[53px] ui-px-[3.5px]': size === 'lg',
            'ui-h-[34px] ui-w-[62px] ui-px-[4px]': size === 'xl',
          },
          {
            'focus:ui-ring-primary-400 focus:ui-ring-opacity-40 data-[state=checked]:ui-bg-primary-500':
              true,
          },
          {
            'ui-min-w-14 ui-w-auto ui-flex ui-items-center ui-px-1':
              labelInside && size === 'sm',
            'ui-min-w-16 ui-w-auto ui-flex ui-items-center ui-px-1':
              labelInside && size === 'md',
            'ui-min-w-20 ui-w-auto ui-flex ui-items-center ui-px-1':
              labelInside && size === 'lg',
            'ui-min-w-24 ui-w-auto ui-flex ui-items-center ui-px-1':
              labelInside && size === 'xl',
          },
          colorInside?.on,
          colorInside?.off
        )}
      >
        <SwitchPrimitive.Thumb asChild>
          <motion.span
            layout
            transition={{ ease: 'easeInOut', duration: 0.15 }}
            className={cx(
              'ui-block',
              'ui-shadow-xs ui-rounded-full ui-bg-white ui-ring-1 ui-ring-black ui-ring-opacity-5 ui-order-1',
              {
                'ui-h-[15px] ui-w-[15px]': size === 'sm',
                'ui-h-[19px] ui-w-[19px]': size === 'md',
                'ui-h-[23px] ui-w-[23px]': size === 'lg',
                'ui-h-[27px] ui-w-[27px]': size === 'xl',
                'ui-order-2': labelInside && checked,
              }
            )}
          ></motion.span>
        </SwitchPrimitive.Thumb>
        {labelInside && (
          <div
            className={cx(
              'ui-inset-0 ui-flex ui-items-center ui-justify-between ui-font-medium ui-text-primary-surface ui-text-sm ui-order-2 ui-mr-1',
              {
                'ui-text-primary-contrast ui-order-1 ui-mr-0': checked,
              }
            )}
          >
            <span
              className={cx({
                'ui-hidden': checked,
              })}
            >
              {labelInside?.off ?? ''}
            </span>
            <span
              className={cx('ui-hidden', {
                'ui-inline': checked,
              })}
            >
              {labelInside?.on ?? ''}
            </span>
          </div>
        )}
      </SwitchPrimitive.Root>

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
                'ui-cursor-not-allowed  ui-text-gray-600': disabled,
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
})
