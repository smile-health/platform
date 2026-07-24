'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { useControllableState } from '#hooks/useControlableState'
import cx from '#lib/cx'

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    showLabel?: 'always' | 'hover' | 'none'
    formatLabel?: (value: number) => string
  }
>(
  (
    {
      value,
      onValueChange,
      defaultValue,
      disabled,
      showLabel = 'hover',
      formatLabel,
      ...props
    },
    ref
  ) => {
    const [_value, _onValueChange] = useControllableState({
      value: value,
      onChange: onValueChange,
      defaultValue: defaultValue ?? [0],
    })

    const [showTooltip, setShowTooltip] = React.useState(false)
    return (
      <SliderPrimitive.Root
        ref={ref}
        {...props}
        disabled={disabled}
        value={_value}
        onValueChange={_onValueChange}
        className={cx(
          'ui-relative ui-flex ui-w-full ui-touch-none ui-select-none ui-items-center data-[disabled]:ui-opacity-50'
        )}
      >
        <SliderPrimitive.Track className="ui-relative ui-h-2 ui-w-full ui-grow ui-overflow-hidden ui-rounded-full ui-bg-gray-200 ui-shadow-inner">
          <SliderPrimitive.Range className="ui-absolute ui-h-full ui-bg-primary-500" />
        </SliderPrimitive.Track>

        {_value.map((value) => (
          <SliderPrimitive.Thumb key={`thumb-${value}`} asChild>
            <button
              onMouseEnter={() => {
                if (disabled ?? showLabel === 'none') {
                  return
                }
                setShowTooltip(true)
              }}
              onMouseLeave={() => {
                if (disabled ?? showLabel === 'none') {
                  return
                }
                setShowTooltip(false)
              }}
              className="ui-relative ui-block ui-h-5 ui-w-5 ui-rounded-full ui-border-[3px] ui-border-primary-500 ui-bg-white ui-text-gray-700 ui-shadow-lg focus:ui-outline-none focus:ui-ring-2 focus:ui-ring-primary-500 focus:ui-ring-opacity-25 focus:ui-ring-offset-1"
            >
              <div
                data-show={showTooltip || showLabel === 'always'}
                className="ui-absolute ui-inset-0 -ui-top-7 ui-flex ui-justify-center ui-opacity-0 ui-transition-opacity ui-duration-150 data-[show=true]:ui-opacity-100"
              >
                <div className="ui-flex ui-h-5 min-w-max ui-items-center ui-rounded ui-bg-black ui-px-1 ui-text-center ui-text-xs ui-leading-none ui-text-white ui-ring-1 ui-ring-white">
                  {formatLabel ? formatLabel(value) : value}
                </div>
              </div>
            </button>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Root>
    )
  }
)

Slider.displayName = SliderPrimitive.Root.displayName
