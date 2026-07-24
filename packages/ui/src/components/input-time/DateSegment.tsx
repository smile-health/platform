import { useRef } from 'react'
import { useDateSegment } from '@react-aria/datepicker'
import cx from '#lib/cx'
import type {
  DateFieldState,
  DateSegment as DateSegmentType,
} from 'react-stately'

export function DateSegment({
  segment,
  state,
}: Readonly<{
  segment: DateSegmentType
  state: DateFieldState
}>) {
  const ref = useRef<HTMLDivElement>(null)
  const { segmentProps } = useDateSegment(segment, state, ref)

  return (
    <div
      {...segmentProps}
      ref={ref}
      style={{
        ...segmentProps.style,
      }}
      className={cx(
        'ui-box-content ui-leading-none ui-outline-none ui-group ',
        'ui-py-1 focus:ui-bg-primary-500 focus:ui-text-white',
        'ui-text-right ui-text-sm ui-tabular-nums',
        {
          'ui-text-gray-400': segment.isPlaceholder,
          'ui-text-gray-500': !segment.isEditable && !segment.isPlaceholder,
          'ui-text-gray-800': segment.isEditable && !segment.isPlaceholder,
        }
      )}
    >
      {/* Always reserve space for the placeholder, to prevent layout shift when editing. */}
      {segment.isPlaceholder
        ? segment.type === 'hour'
          ? 'hh'
          : segment.type === 'minute'
            ? 'mm'
            : segment.placeholder
        : segment.text}
    </div>
  )
}
