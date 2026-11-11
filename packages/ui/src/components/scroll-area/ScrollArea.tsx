'use client'

import * as React from 'react'
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area'
import cx from '#lib/cx'

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cx('ui:relative ui:overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="ui:h-full ui:w-full ui:rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar orientation="horizontal" />
    <ScrollBar orientation="vertical" />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    forceMount
    className={cx(
      'ui:flex ui:touch-none ui:select-none ui:transition-opacity ui:duration-200 ui:data-[state=hidden]:opacity-0 ui:data-[state=visible]:opacity-90',
      orientation === 'vertical' &&
        'ui:h-full ui:w-2 ui:border-l ui:border-l-transparent ui:p-px',
      orientation === 'horizontal' &&
        'ui:h-2 ui:flex-col ui:border-t ui:border-t-transparent ui:p-px',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb
      forceMount
      className="ui:relative ui:flex-1 ui:rounded-full ui:bg-gray-400 "
    />
  </ScrollAreaPrimitive.Scrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
