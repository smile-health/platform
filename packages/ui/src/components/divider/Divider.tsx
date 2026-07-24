'use client'

import * as React from 'react'
import cx from '#lib/cx'

type DividerProps = {
  children?: React.ReactNode
  position?: 'left' | 'center' | 'right'
  withGap?: boolean
  className?: string
}

export function Divider({
  children,
  position = 'center',
  withGap = true,
  className = '',
}: Readonly<DividerProps>) {
  return (
    <div
      className={cx(
        'ui-my-8 ui-flex ui-items-center',
        {
          'ui-h-px ui-border-0 ui-bg-gray-300': !children,
          'ui-gap-4': withGap,
          'after:ui-h-px after:ui-flex-1 after:ui-bg-gray-300 after:content-[""]':
            position === 'left',
          'before:ui-h-px before:ui-flex-1 before:ui-bg-gray-300 before:content-[""]':
            position === 'right',
          'before:ui-h-px before:ui-flex-1 before:ui-bg-gray-300 before:content-[""] after:ui-h-px after:ui-flex-1 after:ui-bg-gray-300 after:content-[""]':
            position === 'center',
        },
        className
      )}
    >
      {children}
    </div>
  )
}
