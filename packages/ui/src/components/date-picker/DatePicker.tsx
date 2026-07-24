'use client'

import React, { useEffect, useState } from 'react'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { DateValue } from '@internationalized/date'
import cx from '#lib/cx'
import { AnimatePresence } from 'framer-motion'
import { AriaDatePickerProps, I18nProvider, useDatePicker } from 'react-aria'
import { useDatePickerState } from 'react-stately'

import { FieldButton } from './Button'
import { Calendar } from './Calendar'
import { ClearButton } from './ClearButton'
import { DateField } from './DateField'
import { Dialog } from './Dialog'
import { Popover } from './Popover'

export type DatePickerProps = AriaDatePickerProps<DateValue> & {
  error?: boolean
  required?: boolean
  locale?: string
  clearable?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
export function DatePicker(props: DatePickerProps) {
  const state = useDatePickerState(props)
  const ref = React.useRef<HTMLDivElement>(null)
  const { groupProps, fieldProps, buttonProps, dialogProps, calendarProps } =
    useDatePicker(props, state, ref)

  const allError = state.isInvalid || props.error
  const size = props.size ?? 'md'

  // Hack for framer-motion: delay isOpen by one effect cycle so AnimatePresence
  // can play exit animations. We also pre-calculate the popup placement here so
  // that both state updates are batched into a single render.
  const [isOpen, setIsOpen] = useState(false)
  const [placement, setPlacement] = useState<'bottom start' | 'top start'>(
    'bottom start'
  )

  useEffect(() => {
    if (state.isOpen && ref.current) {
      const { bottom } = ref.current.getBoundingClientRect()
      // Calendar is ~350 px tall; if there is less than 400 px of space below
      // the trigger, open the calendar upward instead.
      setPlacement(
        window.innerHeight - bottom < 400 ? 'top start' : 'bottom start'
      )
    }
    setIsOpen(state.isOpen)
  }, [state.isOpen])

  return (
    <I18nProvider locale={props.locale ?? 'en-UK'}>
      <div className="ui-relative ui-flex ui-w-full ui-flex-col ui-text-left">
        <div
          {...groupProps}
          ref={ref}
          className={cx(
            'ui-flex ui-items-center ui-justify-center ui-rounded ui-border ui-pr-1',
            //size style
            {
              'ui-h-8 ui-text-sm': size === 'sm',
              'ui-h-10 ui-text-base': size === 'md',
              'ui-h-12 ui-text-lg': size === 'lg',
              'ui-h-14 ui-text-xl': size === 'xl',
            },
            'focus-within:ui-ring-2 focus-within:ui-ring-opacity-25',
            {
              'ui-cursor-not-allowed ui-bg-gray-100 ui-opacity-75':
                props.isDisabled,
            },
            {
              'ui-border-gray-300': !allError,
              'ui-border-danger-500': allError,
            },
            {
              'focus-within:ui-border-danger-500 focus-within:ui-ring-danger-500':
                allError,
              'focus-within:ui-border-primary-500 focus-within:ui-ring-primary-500':
                !allError,
            }
          )}
        >
          <div className="ui-flex-1 ui-px-2 ui-relative">
            <DateField {...fieldProps} id={props.id} />
            {state.value !== null && props.clearable ? (
              <ClearButton
                id={props.id}
                aria-label="Clear"
                type="button"
                onPress={() => state.setValue(null)}
              >
                <XMarkIcon className="ui-size-4"></XMarkIcon>
              </ClearButton>
            ) : null}
          </div>
          <FieldButton
            isDisabled={props.isDisabled}
            {...buttonProps}
            id={props.id}
          >
            <CalendarIcon className="ui-h-4 ui-w-4 ui-text-gray-800"></CalendarIcon>
          </FieldButton>
        </div>
        <AnimatePresence>
          {isOpen && (
            <Popover state={state} triggerRef={ref} placement={placement}>
              <Dialog {...dialogProps}>
                <Calendar {...calendarProps} id={props.id} />
              </Dialog>
            </Popover>
          )}
        </AnimatePresence>
      </div>
    </I18nProvider>
  )
}
