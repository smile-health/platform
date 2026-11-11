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
    <div className="ui:relative ui:flex ui:w-full ui:flex-col ui:text-left">
      <div
        {...fieldProps}
        ref={ref}
        className={cx(
          'ui:flex ui:items-center ui:justify-start ui:rounded ui:border ui:px-2',
          'ui:h-10',
          'ui:focus-within:ring-2',
          {
            'ui:cursor-not-allowed ui:bg-gray-100 ui:opacity-75':
              props.isDisabled,
          },
          {
            'ui:border-gray-300': !allError,
            'ui:border-danger-500': allError,
          },
          {
            'ui:focus-within:border-danger-500 ui:focus-within:ring-danger-500/25':
              allError,
            'ui:focus-within:border-primary-500 ui:focus-within:ring-primary-500/25':
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
