'use client'

import React, { createContext, useContext, useMemo } from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import cx from '#lib/cx'
import { ClassValue } from 'clsx'

export type TabsVariant = 'default' | 'pills'

type TabsProviderPrams = {
  variant: TabsVariant
  orientation: 'vertical' | 'horizontal'
  grow: boolean
  align: 'start' | 'center' | 'end' | 'stretch'
}

const TabCtx = createContext<TabsProviderPrams>({
  orientation: 'horizontal',
  variant: 'default',
  grow: true,
  align: 'start',
})

type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> & {
  leftSection?: React.ReactNode
  rightSection?: React.ReactNode
  buttonClassName?: string
}

export function TabsTrigger({
  children,
  disabled,
  leftSection,
  rightSection,
  buttonClassName,
  ...props
}: TabsTriggerProps) {
  const { orientation, variant, grow } = useContext(TabCtx)

  const variantStyle: Record<TabsVariant, string> = {
    default: cx(
      'ui-flex ui-items-center ui-border-transparent ui-px-3 ui-py-3 ui-font-medium ui-text-gray-700 group ',
      'data-[state=active]:ui-text-primary-700',
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
      },
      buttonClassName
    ),
    pills: cx(
      'ui-flex ui-items-center ui-py-3 ui-px-10 ui-text-dark-blue ui-group',
      'data-[state=active]:ui-bg-slate-200 data-[state=active]:ui-font-bold ui-bg-white',
      {
        'ui-flex-1': grow,
      },
      {
        'ui-cursor-not-allowed ui-opacity-50': disabled,
      },
      buttonClassName
    ),
  }
  return (
    <TabsPrimitive.Trigger {...props} asChild disabled={disabled}>
      <button className={variantStyle[variant]}>
        {leftSection ? <div className="ui-mr-2"> {leftSection}</div> : null}
        {children}
        {rightSection ? <div className="ui-ml-2">{rightSection}</div> : null}
      </button>
    </TabsPrimitive.Trigger>
  )
}

export function TabsList({
  children,
  className,
}: {
  readonly children?: React.ReactNode
  readonly className?: string
}) {
  const { orientation, variant, align } = useContext(TabCtx)

  const pillsClassConfig = {
    'ui-inline-flex ui-border ui-border-zinc-300 ui-divide-zinc-300 ui-rounded ui-overflow-hidden':
      true,
    'ui-flex-row ui-divide-x': orientation === 'horizontal',
    'ui-flex-col ui-divide-y': orientation === 'vertical',
  }
  const classConfig: Record<string, ClassValue> = {
    default: {
      'ui-justify-start': align === 'start',
      'ui-justify-center': align === 'center',
      'ui-justify-end': align === 'end',
      'ui-flex ui-max-w-full ui-border-gray-200': true,
      'ui-flex-row ui-border-b': orientation === 'horizontal',
      'ui-flex-col ui-border-r': orientation === 'vertical',
    },
    pills_stretch: {
      'ui-grid ui-grid-flow-col ui-justify-stretch ui-overflow-hidden':
        orientation === 'horizontal',
      'ui-divide-x ui-border ui-border-zinc-300 ui-divide-zinc-300 ui-rounded':
        orientation === 'horizontal',
    },
    pills_start: {
      'ui-self-start': true,
      ...pillsClassConfig,
    },
    pills_center: {
      'ui-self-center': true,
      ...pillsClassConfig,
    },
    pills_end: {
      'ui-self-end': true,
      ...pillsClassConfig,
    },
  }

  return (
    <TabsPrimitive.List
      className={cx(
        classConfig?.[variant],
        classConfig?.[`${variant}_${align}`],
        className
      )}
    >
      {children}
    </TabsPrimitive.List>
  )
}

type TabsRootProps = React.ComponentProps<typeof TabsPrimitive.Root> &
  Partial<TabsProviderPrams>

export function TabsRoot({
  orientation = 'horizontal',
  variant = 'default',
  align = 'start',
  grow = false,
  activationMode = 'manual',
  ...props
}: TabsRootProps) {
  const value = useMemo(() => {
    return { orientation, variant, align, grow }
  }, [orientation, variant, align, grow])

  return (
    <TabCtx.Provider value={value}>
      <TabsPrimitive.Root
        {...props}
        activationMode={activationMode}
        orientation={orientation}
        className={cx({
          'block': orientation === 'horizontal',
          'ui-flex ui-flex-col':
            orientation === 'horizontal' && variant === 'pills',
          'ui-flex ui-flex-row': orientation === 'vertical',
          'ui-items-start': orientation === 'vertical' && variant === 'pills',
        })}
      >
        {props.children}
      </TabsPrimitive.Root>
    </TabCtx.Provider>
  )
}

export function TabsContent(
  props: React.ComponentProps<typeof TabsPrimitive.Content>
) {
  const { orientation } = useContext(TabCtx)
  return (
    <TabsPrimitive.Content
      className={cx({
        'ui-py-3': orientation === 'horizontal',
        'ui-px-3 ui-flex-1': orientation === 'vertical',
      })}
      {...props}
    >
      {props.children}
    </TabsPrimitive.Content>
  )
}
