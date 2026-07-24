'use client'

import React from 'react'
import cx from '#lib/cx'

type CommonProps = {
  readonly children: React.ReactNode
}

export function TimelineBullet({
  color = 'neutral',
  children,
}: CommonProps & {
  color?: 'warning' | 'danger' | 'success' | 'info' | 'neutral'
}) {
  return (
    <div
      className={cx(
        'ui-z-10 ui-flex ui-h-8 ui-w-8 ui-items-center ui-justify-center ui-rounded-full ui-border',
        {
          'ui-border-warning-300 ui-bg-warning-100 ui-text-warning-700':
            color === 'warning',
          ' ui-border-danger-300 ui-bg-danger-100 ui-text-danger-700':
            color === 'danger',
          'ui-border-success-300 ui-bg-success-100 ui-text-success-700':
            color === 'success',
          'ui-border-info-300 ui-bg-info-100 ui-text-indigo-700':
            color === 'info',
          'ui-border-neutral-300 ui-bg-gray-100 ui-text-gray-700':
            color === 'neutral',
        }
      )}
    >
      {children}
    </div>
  )
}

export function TimelineContent({ children }: CommonProps) {
  return (
    <div className="ui-flex ui-flex-1 ui-items-center ui-text-sm">
      <div className="ui-space-y-1">{children}</div>
    </div>
  )
}

export function TimelineItem({ children }: CommonProps) {
  return (
    <div
      className={cx(
        'ui-timeline ui-relative ui-mb-5 ui-flex ui-space-x-3',
        'before:-ui-bottom-5 before:ui-left-4 before:ui-top-0 before:absolute',
        'before:ui-border-l-2 before:ui-border-gray-300 before:[&:last-child]:ui-border-transparent'
      )}
    >
      {children}
    </div>
  )
}

export function Timeline({ children }: CommonProps) {
  return <div>{children}</div>
}
