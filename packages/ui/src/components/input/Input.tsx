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
  return <div className="ui:relative ui:flex ui:w-full">{children}</div>
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
          <div className="ui:leading-1 ui:absolute ui:left-0 ui:top-0 ui:flex ui:h-full ui:items-center ui:justify-center ui:px-2 ui:text-gray-600">
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
            'ui:form-input ui:w-full ui:rounded ui:text-gray-800',
            'ui:focus:border-primary-500 ui:focus:outline-hidden ui:focus:ring-primary-500/25',

            //type="file"
            'ui:py-0! ui:file:-ml-3 ui:file:mr-3 ui:file:h-full',
            'ui:file:px-4 ui:file:py-2',
            'ui:file:font-medium ui:file:leading-none ui:file:text-gray-700',
            'ui:file:border-0 ui:file:bg-gray-100 ui:file:ring-1 ui:file:ring-gray-300 ',
            // variant style
            {
              'ui:border-0 ui:bg-gray-100 ui:focus:border ui:focus:ring-2':
                variant === 'filled',
              'ui-bg-white-100 ui:border ui:border-gray-300 ui:focus:ring-2':
                variant === 'outline',
              'ui:cursor-not-allowed ui:bg-gray-100 ui:opacity-75': disabled,
            },

            'ui:data-[error=true]:border ui:data-[error=true]:border-danger-500 ui:data-[error=true]:focus:ring-danger-500/25',

            //size style
            {
              'ui:h-8 ui:text-sm ui:file:text-sm': size === 'sm',
              'ui:h-10 ui:text-base ui:file:text-base': size === 'md',
              'ui:h-12 ui:text-lg ui:file:text-lg': size === 'lg',
              'ui:h-14 ui:text-xl ui:file:text-xl': size === 'xl',
            },
            {
              //add padding to left side when leftIcon is true
              'ui:pl-3': !leftIcon,

              'ui:pl-8': size === 'sm' && leftIcon,
              'ui:pl-9': size === 'md' && leftIcon,
              'ui:pl-10': size === 'lg' && leftIcon,
              'ui:pl-11': size === 'xl' && leftIcon,

              //add padding to right side when rightIcon is true
              'ui:pr-3': !leftIcon,
              'ui:pr-8': size === 'sm' && rightIcon,
              'ui:pr-9': size === 'md' && rightIcon,
              'ui:pr-10': size === 'lg' && rightIcon,
              'ui:pr-11': size === 'xl' && rightIcon,
            },
            // group
            'ui:focus:group-[.is-group]:z-10',
            'ui:first:group-[.is-group]:rounded-r-none!',
            'ui:[&:not(:first-child):not(:last-child)]:group-[.is-group]:rounded-none!',
            'ui:last:group-[.is-group]:rounded-l-none!',

            props.className
          )}
        />

        {rightIcon ? (
          <div className="ui:leading-1 ui:absolute ui:right-0 ui:top-0 ui:z-10 ui:flex ui:h-full ui:items-center ui:justify-center ui:px-2 ui:text-gray-600">
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
        'ui:leading-1 ui:flex ui:items-center ui:justify-center ui:rounded-l ui:text-gray-700',
        'ui:border ui:border-r-0 ui:border-gray-300 ui:bg-gray-100 ui:px-3'
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
        'ui:leading-1 ui:flex ui:items-center ui:justify-center ui:rounded-r ui:text-gray-700',
        'ui:border ui:border-l-0 ui:border-gray-300 ui:bg-gray-100 ui:px-3'
      )}
    >
      {children}
    </div>
  )
}
export function InputGroup({ children }: ChildrenProps) {
  return (
    <InputGroupCtx.Provider value={true}>
      <div className="is-group ui:relative ui:flex ui:w-full ui:group">
        {children}
      </div>
    </InputGroupCtx.Provider>
  )
}
