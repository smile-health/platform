import React, { forwardRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import cx from '#lib/cx'

type Props = React.ComponentProps<'button'> & {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const CloseButton = forwardRef<HTMLButtonElement, Props>(
  function CloseButton({ size = 'md', ...props }: Props, ref) {
    return (
      <button
        {...props}
        ref={ref}
        className={cx(
          'ui-h-5 ui-w-5 ui-rounded ui-p-1 ui-text-gray-800 ui-transition-colors hover:ui-bg-gray-100 active:ui-bg-gray-200',
          {
            'ui-h-6 ui-w-6': size === 'sm',
            'ui-h-7 ui-w-7': size === 'md',
            'ui-h-8 ui-w-8': size === 'lg',
            'ui-h-9 ui-w-9': size === 'xl',
          },
          props.className
        )}
      >
        <XMarkIcon />
      </button>
    )
  }
)
