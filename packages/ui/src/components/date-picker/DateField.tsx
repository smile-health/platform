'use client'

import { useRef } from 'react'
import { createCalendar } from '@internationalized/date'
import cx from '#lib/cx'
import {
  AriaDateFieldProps,
  DateValue,
  useDateField,
  useDateSegment,
  useLocale,
} from 'react-aria'
import { useDateFieldState } from 'react-stately'
import type {
  DateFieldState,
  DateSegment as DateSegmentType,
} from 'react-stately'

export function DateField(props: Readonly<AriaDateFieldProps<DateValue>>) {
  const { locale } = useLocale()
  const state = useDateFieldState({
    ...props,
    locale,
    createCalendar,
  })

  const ref = useRef<HTMLDivElement>(null)
  const { fieldProps } = useDateField(props, state, ref)

  return (
    <div {...fieldProps} ref={ref} className="ui-flex">
      {state.segments.map((segment, i) => (
        <DateSegment
          key={i + 1}
          segment={segment}
          state={state}
          id={`${props.id}-${segment?.type}`}
        />
      ))}
    </div>
  )
}
function DateSegment({
  id,
  segment,
  state,
}: Readonly<{
  id?: string
  segment: DateSegmentType
  state: DateFieldState
}>) {
  const ref = useRef<HTMLDivElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)

  return (
    <div
      {...segmentProps}
      id={id}
      data-testid={id}
      ref={ref}
      style={{
        ...segmentProps.style,
      }}
      className={cx(
        'ui-box-content ui-leading-none ui-outline-none group ',
        'ui-py-1 focus:ui-bg-primary-500 focus:ui-text-primary-contrast',
        'ui-text-right ui-text-sm ui-tabular-nums',
        {
          '!ui-text-gray-500': !segment.isEditable || segment.isPlaceholder,
          'ui-text-gray-800': segment.isEditable,
        }
      )}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}

      {segment.isPlaceholder ? segment.placeholder : segment.text}
    </div>
  )
}
