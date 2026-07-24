'use client'

import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import cx from '#lib/cx'

import { Input } from './Input'

type InputSearchProps = Omit<React.ComponentProps<typeof Input>, 'type'>

export const InputSearch = React.forwardRef<HTMLInputElement, InputSearchProps>(
  (props: InputSearchProps, ref) => {
    const size = props.size ? props.size : 'md'
    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        leftIcon={
          <MagnifyingGlassIcon
            className={cx({
              'ui-h-3.5 ui-w-3.5': size === 'sm',
              'ui-h-4 ui-w-4': size === 'md',
              'ui-h-5 ui-w-5': size === 'lg',
              'ui-h-6 ui-w-6': size === 'xl',
            })}
          ></MagnifyingGlassIcon>
        }
      ></Input>
    )
  }
)

InputSearch.displayName = 'InputSearch'
