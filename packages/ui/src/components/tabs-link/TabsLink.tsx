'use client'

import React, { createContext, useContext, useMemo } from 'react'
import Link from 'next/link'
import cx from '#lib/cx'

export type TabsLinkVariant = 'default' | 'pills'

type TabsProviderPrams = {
  variant: TabsLinkVariant
  orientation: 'vertical' | 'horizontal'
  grow: boolean
  align: 'start' | 'center' | 'end'
}

const TabCtx = createContext<TabsProviderPrams>({
  orientation: 'horizontal',
  variant: 'default',
  grow: true,
  align: 'start',
})

type TabsTriggerProps = React.ComponentProps<typeof Link> & {
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  disabled?: boolean
  active?: boolean
  className?: string
}

export function TabsLinkTrigger({
  children,
  href,
  disabled,
  leftSection,
  rightSection,
  active,
  className,
  ...props
}: TabsTriggerProps) {
  const { orientation, variant, grow } = useContext(TabCtx)

  const variantStyle: Record<TabsLinkVariant, string> = {
    default: cx(
      'ui-flex ui-items-center ui-border-transparent ui-px-3 ui-py-3 ui-font-medium ui-text-gray-700 ui-group ',
      'data-[state=active]:ui-font-semibold',
      {
        'ui-border-b-[3px] data-[state=active]:ui-border-b-primary-500':
          orientation === 'horizontal',
        'ui-border-r-[3px] data-[state=active]:ui-border-r-primary-500':
          orientation === 'vertical',
        'ui-flex-1': grow,
      },
      {
        'hover:ui-bg-gray-50': !disabled,
        'ui-cursor-not-allowed ui-opacity-50': disabled,
      }
    ),
    pills: cx(
      'ui-flex ui-items-center ui-py-3 ui-px-10 ui-text-dark-blue ui-group',
      'data-[state=active]:ui-bg-stone-100 data-[state=active]:ui-font-bold',
      {
        'ui-flex-1': grow,
      },
      {
        'ui-cursor-not-allowed ui-opacity-50': disabled,
      },
      className
    ),
  }

  return (
    <Link
      href={disabled ? '#' : href}
      data-state={active ? 'active' : 'inactive'}
      {...props}
      className={variantStyle[variant]}
    >
      {leftSection ? <div className="ui-mr-2"> {leftSection}</div> : null}
      {children}
      {rightSection ? <div className="ui-ml-2">{rightSection}</div> : null}
    </Link>
  )
}

export function TabsLinkList({
  children,
  className,
}: {
  readonly children?: React.ReactNode
  readonly className?: string
}) {
  const { orientation, variant, align } = useContext(TabCtx)
  return (
    <div
      className={cx(
        variant === 'default' && {
          'ui-justify-start': align === 'start',
          'ui-justify-center': align === 'center',
          'ui-justify-end': align === 'end',
          'ui-flex ui-max-w-full ui-border-gray-200': true,
          'ui-flex-row ui-border-b': orientation === 'horizontal',
          'ui-flex-col ui-border-r': orientation === 'vertical',
        },
        variant === 'pills' && {
          'ui-mx-auto': align === 'center' && orientation === 'horizontal',
          'ui-ml-auto': align === 'end' && orientation === 'horizontal',
          'ui-inline-flex ui-border ui-border-zinc-300 ui-divide-zinc-300 ui-rounded ui-overflow-hidden': true,
          'ui-flex-row ui-divide-x': orientation === 'horizontal',
          'ui-flex-col ui-divide-y': orientation === 'vertical',
        },
        className
      )}
    >
      {children}
    </div>
  )
}

type TabsLinkRootProps = Partial<TabsProviderPrams> & {
  children?: React.ReactNode
}

export function TabsLinkRoot({
  orientation = 'horizontal',
  variant = 'default',
  align = 'start',
  grow = false,
  ...props
}: TabsLinkRootProps) {
  const value = useMemo(() => {
    return { orientation, variant, align, grow }
  }, [orientation, variant, align, grow])

  return (
    <TabCtx.Provider value={value}>
      <div
        className={cx({
          'ui-flex': orientation === 'horizontal' && variant === 'pills',
          'block': orientation === 'horizontal',
          'ui-flex ui-flex-row': orientation === 'vertical',
        })}
      >
        {props.children}
      </div>
    </TabCtx.Provider>
  )
}
