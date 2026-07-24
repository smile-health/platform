'use client'

import React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import cx from '#lib/cx'

const stripedStyle: React.CSSProperties = {
  backgroundSize: '20px 20px',
  backgroundImage:
    'linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent)',
}

type ProgressProps = React.ComponentPropsWithoutRef<
  typeof ProgressPrimitive.Root
> & {
  withStripe?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ value, withStripe, size = 'sm', ...props }, ref) => {
  const style = withStripe ? stripedStyle : {}
  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={value}
      className={cx('ui-w-full ui-overflow-hidden ui-rounded ui-bg-gray-200', {
        'ui-h-2': size === 'sm',
        'ui-h-3': size === 'md',
        'ui-h-4': size === 'lg',
        'ui-h-5': size === 'xl',
      })}
      {...props}
    >
      <ProgressPrimitive.Indicator
        style={{
          width: `${value}%`,
          ...style,
        }}
        className={cx(
          'ui-h-full ui-bg-primary-500 ui-duration-300 ui-ease-in-out'
        )}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
