import React, { useRef, useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import cx from '#lib/cx'
import {
  AriaButtonProps,
  AriaNumberFieldProps,
  useButton,
  useFocusWithin,
  useLocale,
  useNumberField,
} from 'react-aria'
import { useNumberFieldState } from 'react-stately'

function Button(props: Readonly<AriaButtonProps<'button'>>) {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const { children } = props

  return (
    <button
      {...buttonProps}
      ref={ref}
      className="ui-flex ui-h-full ui-w-6 ui-items-center ui-justify-center active:ui-bg-gray-100 disabled:ui-bg-gray-100 leading-none disabled:opacity-50"
    >
      {children}
    </button>
  )
}

type InputNumberProps = Omit<AriaNumberFieldProps, 'isDisabled'> & {
  name?: string
  hideStepper?: boolean
  icon?: React.ReactNode
  error?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  locale?: string
  disabled?: boolean
  className?: string
}
export const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      name,
      error,
      size = 'md',
      icon,
      hideStepper,
      locale,
      disabled,
      className,
      ...otherProps
    },
    ref
  ) => {
    const defaultLocale = useLocale()
    const props = { ...otherProps, isDisabled: disabled }
    const state = useNumberFieldState({
      ...props,
      locale: locale ?? defaultLocale.locale,
    })

    const fallbackRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || fallbackRef

    const {
      groupProps,
      inputProps,
      incrementButtonProps,
      decrementButtonProps,
    } = useNumberField(props, state, inputRef)

    const [isFocusWithin, setIsFocusWithin] = useState(false)
    const { focusWithinProps } = useFocusWithin({
      onFocusWithinChange: (isFocusWithin) => setIsFocusWithin(isFocusWithin),
    })

    return (
      <div {...groupProps}>
        <div
          {...focusWithinProps}
          className={cx(
            'ui-relative ui-flex ui-overflow-hidden ui-rounded ui-border ui-text-gray-800',
            {
              'ui-border-primary-500 ui-ring-2 ui-ring-primary-500 ui-ring-opacity-25':
                isFocusWithin && !error,

              'ui-border-danger-500 ui-ring-2 ui-ring-danger-500 ui-ring-opacity-25':
                isFocusWithin && error,

              'ui-border-gray-300': !isFocusWithin && !error,

              'ui-border-danger-500': !isFocusWithin && error,
            },
            {
              'ui-h-8 ui-text-sm': size === 'sm',
              'ui-h-10 ui-text-base': size === 'md',
              'ui-h-12 ui-text-lg': size === 'lg',
              'ui-h-14 ui-text-xl': size === 'xl',
            }
          )}
        >
          {icon ? (
            <div
              className={cx(
                'ui-flex ui-items-center ui-justify-center ui-px-2 ui-text-gray-700',
                {
                  'ui-bg-gray-100 ui-opacity-75': props.isDisabled,
                }
              )}
            >
              {icon}
            </div>
          ) : null}

          <input
            {...inputProps}
            name={name}
            className={cx(
              'ui-w-full ui-border-none focus:ui-outline-none focus:ui-ring-0 disabled:ui-bg-gray-100 disabled:ui-opacity-75 ',
              {
                'ui-px-3': !icon,
                'ui-pl-0 ui-pr-3': icon,
              },
              {
                'ui-text-sm': size === 'sm',
                'ui-text-base': size === 'md',
                'ui-text-lg': size === 'lg',
                'ui-text-xl': size === 'xl',
              },
              className
            )}
            ref={inputRef}
          />
          {hideStepper ? null : (
            <div
              className={`ui-flex ui-flex-col ui-border-l ui-border-inherit`}
            >
              <Button {...incrementButtonProps}>
                <ChevronUpIcon
                  className={cx({
                    'ui-h-2.5 ui-w-2.5': size === 'sm',
                    'ui-h-3 ui-w-3': size === 'md',
                    'ui-h-4 ui-w-4': size === 'xl' || size === 'lg',
                  })}
                ></ChevronUpIcon>
              </Button>
              <div className="ui-border-t ui-border-inherit"></div>
              <Button {...decrementButtonProps}>
                <ChevronDownIcon
                  className={cx({
                    'ui-h-2.5 ui-w-2.5': size === 'sm',
                    'ui-h-3 ui-w-3': size === 'md',
                    'ui-h-4 ui-w-4': size === 'xl' || size === 'lg',
                  })}
                ></ChevronDownIcon>
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
)

InputNumber.displayName = 'InputNumber'
