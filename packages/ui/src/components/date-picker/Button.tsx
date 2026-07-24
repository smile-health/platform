'use client'

import { useRef } from 'react'
import cx from '#lib/cx'
import {
  AriaButtonProps,
  mergeProps,
  useButton,
  useFocusRing,
} from 'react-aria'

export function CalendarButton(props: Readonly<AriaButtonProps<'button'>>) {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const { focusProps, isFocused } = useFocusRing()

  return (
    <button
      {...mergeProps(buttonProps, focusProps)}
      data-testid={buttonProps.id}
      ref={ref}
      className={cx(
        'ui-shadow-xs ui-flex ui-h-8 ui-w-8 ui-items-center ui-justify-center ui-rounded ui-border ui-border-gray-300 ui-bg-white',
        {
          'hover:ui-bg-primary-50 active:ui-bg-primary-100': !props.isDisabled,
          'ui-cursor-not-allowed ui-opacity-30': props.isDisabled,
          'ui-outline-none ui-ring-2 ui-ring-primary-500 ui-ring-opacity-20':
            isFocused,
        }
      )}
    >
      {props.children}
    </button>
  )
}

export function FieldButton(props: Readonly<AriaButtonProps<'button'>>) {
  const ref = useRef<HTMLButtonElement>(null)
  const { buttonProps } = useButton(props, ref)
  const id = `${buttonProps.id}-field-button`

  return (
    <button
      {...buttonProps}
      id={id}
      data-testid={id}
      ref={ref}
      className={cx('ui-h-8 ui-rounded ui-outline-none px-2', {
        'hover:ui-bg-gray-100 active:ui-bg-gray-200': !props.isDisabled,
        'ui-cursor-not-allowed ui-opacity-50': props.isDisabled,
      })}
    >
      {props.children}
    </button>
  )
}
