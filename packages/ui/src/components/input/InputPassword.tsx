'use client'

import React, { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import cx from '#lib/cx'

import { Input } from './Input'

type InputPasswordProps = Omit<React.ComponentProps<typeof Input>, 'type'>

export const InputPassword = React.forwardRef<
  HTMLInputElement,
  InputPasswordProps
>((props, ref) => {
  const [type, setType] = useState('password')
  const size = props.size ? props.size : 'md'
  return (
    <Input
      {...props}
      ref={ref}
      type={type}
      rightIcon={
        <button
          type="button"
          onClick={() => setType(type === 'password' ? 'text' : 'password')}
        >
          {type === 'password' ? (
            <EyeIcon
              className={cx({
                'ui-h-3.5 ui-w-3.5': size === 'sm',
                'ui-h-4 ui-w-4': size === 'md',
                'ui-h-5 ui-w-5': size === 'lg',
                'ui-h-6 ui-w-6': size === 'xl',
              })}
            />
          ) : (
            <EyeSlashIcon
              className={cx({
                'ui-h-3.5 ui-w-3.5': size === 'sm',
                'ui-h-4 ui-w-4': size === 'md',
                'ui-h-5 ui-w-5': size === 'lg',
                'ui-h-6 ui-w-6': size === 'xl',
              })}
            />
          )}
        </button>
      }
    ></Input>
  )
})

InputPassword.displayName = 'Input'
