import { useRef } from 'react'
import { useTimeField } from '@react-aria/datepicker'
import { useLocale } from '@react-aria/i18n'
import { useTimeFieldState } from '@react-stately/datepicker'
import cx from '#lib/cx'
import { AriaTimeFieldProps, TimeValue } from 'react-aria'

import { DateSegment } from './DateSegment'

type InputTimeProps = AriaTimeFieldProps<TimeValue> & {
  error?: boolean
  required?: boolean
}

export function InputTime(props: InputTimeProps) {
  const { locale } = useLocale()
  const state = useTimeFieldState({
    ...props,
    locale,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useTimeField(props, state, ref)
  const allError = state.isInvalid || props.error
  return (
    <div className="ui-relative ui-flex ui-w-full ui-flex-col ui-text-left">
      <div
        {...fieldProps}
        ref={ref}
        className={cx(
          'ui-flex ui-items-center ui-justify-start ui-rounded ui-border ui-px-2',
          'ui-h-10',
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
        {state.segments.map((segment, i) => (
          <DateSegment
            key={JSON.stringify(segment) + i}
            segment={segment}
            state={state}
          />
        ))}
      </div>
    </div>
  )
}
