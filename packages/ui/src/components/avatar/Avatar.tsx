'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { UserIcon } from '@heroicons/react/24/solid'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { Slot, Slottable } from '@radix-ui/react-slot'
import cx from '#lib/cx'

import { generateColor } from './generateColor'

const AvatarCtx = createContext({ isGroup: false })

function getInitials(name: string) {
  if (name.length <= 1) {
    return name
  }
  const [firstName, lastName] = name.toUpperCase().trim().split(' ')
  return firstName && lastName
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
    : firstName.charAt(0)
}

export type AvatarProps = {
  /** @default "md" */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children?: React.ReactNode

  name?: string
  src?: string
  asChild?: boolean
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ name, asChild, size = 'sm', src, ...props }: AvatarProps, ref) => {
    const Component = asChild ? Slot : 'span'
    const color = generateColor(name)
    const { isGroup } = useContext(AvatarCtx)

    return (
      <AvatarPrimitive.Root asChild>
        <Component
          {...props}
          ref={ref}
          className={cx(
            'ui-block ui-rounded-full ui-bg-gray-400 ui-ring-2 ui-ring-white',
            {
              '-ui-mr-3': isGroup,
            },
            {
              'ui-h-8 ui-w-8': size === 'xs',
              'ui-h-10 ui-w-10': size === 'sm',
              'ui-h-12 ui-w-12': size === 'md',
              'ui-h-14 ui-w-14': size === 'lg',
              'ui-h-16 ui-w-16': size === 'xl',
            }
          )}
        >
          <Slottable>{props.children}</Slottable>
          <AvatarPrimitive.Image
            className="ui-h-full ui-w-full ui-object-cover"
            style={{ borderRadius: 'inherit' }}
            src={src}
            alt={name}
          />

          {name ? (
            <AvatarPrimitive.Fallback
              className={cx(
                'ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center ui-font-medium ui-uppercase ui-text-white',
                {
                  'ui-text-xs': size === 'xs',
                  'ui-text-sm': size === 'sm',
                  'ui-text-base': size === 'md',
                  'ui-text-lg': size === 'lg',
                  'ui-text-xl': size === 'xl',
                }
              )}
              style={{ borderRadius: 'inherit', backgroundColor: color }}
            >
              {getInitials(name)}
            </AvatarPrimitive.Fallback>
          ) : (
            <AvatarPrimitive.Fallback
              className="ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center ui-text-white"
              style={{ borderRadius: 'inherit' }}
            >
              <UserIcon
                className={cx({
                  'ui-h-5 ui-w-5': size === 'xs',
                  'ui-h-6 ui-w-6': size === 'sm',
                  'ui-h-8 ui-w-8': size === 'md',
                  'ui-h-10 ui-w-10': size === 'lg',
                  'ui-h-12 ui-w-12': size === 'xl',
                })}
              ></UserIcon>
            </AvatarPrimitive.Fallback>
          )}
        </Component>
      </AvatarPrimitive.Root>
    )
  }
)
Avatar.displayName = AvatarPrimitive.Root.displayName

export function AvatarGroup({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const value = useMemo(() => ({ isGroup: true }), [])

  return (
    <AvatarCtx.Provider value={value}>
      <div className="flex ">{children}</div>
    </AvatarCtx.Provider>
  )
}

type AvatarMoreProps = {
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export function AvatarMore({
  children,
  size = 'sm',
}: Readonly<AvatarMoreProps>) {
  const { isGroup } = useContext(AvatarCtx)
  return (
    <AvatarPrimitive.Root asChild>
      <span
        className={cx(
          'ui-inline-block ui-rounded-full ui-bg-gray-300 ui-ring-1 ui-ring-white',
          {
            '-ui-mr-3': isGroup,
          },
          {
            'ui-h-8 ui-w-8': size === 'xs',
            'ui-h-10 ui-w-10': size === 'sm',
            'ui-h-12 ui-w-12': size === 'md',
            'ui-h-14 ui-w-14': size === 'lg',
            'ui-h-16 ui-w-16': size === 'xl',
          }
        )}
      >
        <span
          className={cx(
            'ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center ui-text-gray-600',
            {
              'ui-text-xs': size === 'xs',
              'ui-text-sm': size === 'sm',
              'ui-text-base': size === 'md',
              'ui-text-lg': size === 'lg',
              'ui-text-xl': size === 'xl',
            }
          )}
          style={{ borderRadius: 'inherit' }}
        >
          {children}
        </span>
      </span>
    </AvatarPrimitive.Root>
  )
}
