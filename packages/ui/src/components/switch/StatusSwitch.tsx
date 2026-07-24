'use client'

import React from 'react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import cx from '#lib/cx'
import { motion } from 'framer-motion'

type StatusSwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
> & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * StatusSwitch - A switch component with status icons
 * - Active (checked): Green track with Check icon on left
 * - Inactive (unchecked): Red track with X icon on right
 */
export const StatusSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  StatusSwitchProps
>(function StatusSwitch(
  {
    size = 'md',
    defaultChecked,
    checked,
    onCheckedChange,
    disabled,
    required,
    name,
    value,
    ...props
  },
  ref
) {
  const sizeClasses = {
    sm: 'ui-h-[20px] ui-w-[36px]',
    md: 'ui-h-[24px] ui-w-[44px]',
    lg: 'ui-h-[29px] ui-w-[53px]',
    xl: 'ui-h-[34px] ui-w-[62px]',
  }

  const thumbSizes = {
    sm: { width: '14px', height: '14px' },
    md: { width: '18px', height: '18px' },
    lg: { width: '22px', height: '22px' },
    xl: { width: '26px', height: '26px' },
  }

  return (
    <div className="ui-inline-flex ui-items-center">
      <SwitchPrimitive.Root
        {...props}
        ref={ref}
        defaultChecked={defaultChecked}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        value={value}
        style={{
          backgroundColor: checked ? '#16a34a' : '#dc2626',
        }}
        className={cx(
          'ui-relative ui-rounded-full ui-shadow-inner',
          'focus:ui-outline-none',
          "ui-flex ui-items-center data-[state='unchecked']:ui-justify-start data-[state='checked']:ui-justify-end",
          'ui-transition-colors ui-duration-150',
          {
            'ui-cursor-not-allowed ui-opacity-50': disabled,
          },
          sizeClasses[size]
        )}
      >
        {/* Status Icons inside track */}
        <div className="ui-absolute ui-inset-0 ui-flex ui-items-center ui-justify-between ui-px-1.5 ui-pointer-events-none ui-z-10">
          <CheckIcon
            className={cx(
              'ui-w-3 ui-h-3 ui-text-white transition-opacity duration-150',
              checked ? 'ui-opacity-100' : 'ui-opacity-0'
            )}
          />
          <XMarkIcon
            className={cx(
              'ui-w-3 ui-h-3 ui-text-white transition-opacity duration-150',
              !checked ? 'ui-opacity-100' : 'ui-opacity-0'
            )}
          />
        </div>

        <SwitchPrimitive.Thumb asChild>
          <motion.span
            layout
            transition={{ ease: 'easeInOut', duration: 0.15 }}
            style={{
              display: 'block',
              width: thumbSizes[size].width,
              height: thumbSizes[size].height,
              marginRight: '4px',
              marginLeft: '4px',
            }}
            className="ui-shadow-sm ui-rounded-full ui-bg-white ui-ring-1 ui-ring-black/5"
          />
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    </div>
  )
})
