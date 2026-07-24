'use client'

import React, { createContext, useContext } from 'react'
import cx from '#lib/cx'

type ChildrenProps = {
  readonly children?: React.ReactNode
}

export type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  ChildrenProps & {
    /** @default "md" */
    size?: 'sm' | 'md' | 'lg' | 'xl'

    /** @default "solid" */
    variant?: 'filled' | 'outline'

    children?: React.ReactNode
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode

    /** @default false */
    error?: boolean
  }

export const InputGroupCtx = createContext(false)

function DefaultContainer({ children }: ChildrenProps) {
  return <div className="ui-relative ui-flex ui-w-full">{children}</div>
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      error,
      disabled,
      leftIcon,
      rightIcon,
      size = 'md',
      variant = 'outline',
      ...props
    },
    ref
  ) {
    const isGroup = useContext(InputGroupCtx)
    const Root = isGroup ? React.Fragment : DefaultContainer
    return (
      <Root>
        {leftIcon ? (
          <div className="ui-leading-1 ui-absolute ui-left-0 ui-top-0 ui-flex ui-h-full ui-items-center ui-justify-center ui-px-2 ui-text-gray-600">
            {leftIcon}
          </div>
        ) : null}

        <input
          {...props}
          data-error={error}
          ref={ref}
          disabled={disabled}
          className={cx(
            // base style
            'ui-form-input ui-w-full ui-rounded ui-text-gray-800',
            'focus:ui-border-primary-500 focus:ui-outline-none focus:ui-ring-primary-500 focus:ui-ring-opacity-25',

            //type="file"
            '!ui-py-0 file:-ui-ml-3 file:ui-mr-3 file:ui-h-full',
            'file:ui-px-4 file:ui-py-2',
            'file:ui-font-medium file:ui-leading-none file:ui-text-gray-700',
            'file:ui-border-0 file:ui-bg-gray-100 file:ui-ring-1 file:ui-ring-gray-300 ',
            // variant style
            {
              'ui-border-0 ui-bg-gray-100 focus:ui-border focus:ui-ring-2':
                variant === 'filled',
              'ui-bg-white-100 ui-border ui-border-gray-300 focus:ui-ring-2':
                variant === 'outline',
              'ui-cursor-not-allowed ui-bg-gray-100 ui-opacity-75': disabled,
            },

            'data-[error=true]:ui-border data-[error=true]:ui-border-danger-500 data-[error=true]:focus:ui-ring-danger-500 data-[error=true]:focus:ui-ring-opacity-25',

            //size style
            {
              'ui-h-8 ui-text-sm file:ui-text-sm': size === 'sm',
              'ui-h-10 ui-text-base file:ui-text-base': size === 'md',
              'ui-h-12 ui-text-lg file:ui-text-lg': size === 'lg',
              'ui-h-14 ui-text-xl file:ui-text-xl': size === 'xl',
            },
            {
              //add padding to left side when leftIcon is true
              'ui-pl-3': !leftIcon,

              'ui-pl-8': size === 'sm' && leftIcon,
              'ui-pl-9': size === 'md' && leftIcon,
              'ui-pl-10': size === 'lg' && leftIcon,
              'ui-pl-11': size === 'xl' && leftIcon,

              //add padding to right side when rightIcon is true
              'ui-pr-3': !leftIcon,
              'ui-pr-8': size === 'sm' && rightIcon,
              'ui-pr-9': size === 'md' && rightIcon,
              'ui-pr-10': size === 'lg' && rightIcon,
              'ui-pr-11': size === 'xl' && rightIcon,
            },
            // group
            'group-[.is-group]:focus:ui-z-10',
            'group-[.is-group]:first:!ui-rounded-r-none',
            'group-[.is-group]:[&:not(:first-child):not(:last-child)]:!ui-rounded-none',
            'group-[.is-group]:last:!ui-rounded-l-none',

            props.className
          )}
        />

        {rightIcon ? (
          <div className="ui-leading-1 ui-absolute ui-right-0 ui-top-0 ui-z-10 ui-flex ui-h-full ui-items-center ui-justify-center ui-px-2 ui-text-gray-600">
            {rightIcon}
          </div>
        ) : null}
      </Root>
    )
  }
)

export function InputLeftAddon({ children }: ChildrenProps) {
  return (
    <div
      className={cx(
        'ui-leading-1 ui-flex ui-items-center ui-justify-center ui-rounded-l ui-text-gray-700',
        'ui-border ui-border-r-0 ui-border-gray-300 ui-bg-gray-100 ui-px-3'
      )}
    >
      {children}
    </div>
  )
}

export function InputRightAddon({ children }: ChildrenProps) {
  return (
    <div
      className={cx(
        'ui-leading-1 ui-flex ui-items-center ui-justify-center ui-rounded-r ui-text-gray-700',
        'ui-border ui-border-l-0 ui-border-gray-300 ui-bg-gray-100 ui-px-3'
      )}
    >
      {children}
    </div>
  )
}
export function InputGroup({ children }: ChildrenProps) {
  return (
    <InputGroupCtx.Provider value={true}>
      <div className="is-group ui-relative ui-flex ui-w-full ui-group">
        {children}
      </div>
    </InputGroupCtx.Provider>
  )
}
