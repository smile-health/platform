'use client'

import React from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import cx from '#lib/cx'

export const AccordionRoot = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(function AccordionItem(props, ref) {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={cx('ui-border-b ui-border-gray-200', props?.className)}
      ref={ref}
    >
      {props.children}
    </AccordionPrimitive.Item>
  )
})

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(function AccordionItem(props, ref) {
  return (
    <AccordionPrimitive.Header className="ui-flex">
      <AccordionPrimitive.Trigger
        {...props}
        className={cx(
          'ui-flex ui-flex-1 ui-items-center ui-justify-between ui-p-3 ui-font-medium ui-text-gray-700 ui-transition-all hover:ui-bg-gray-50 focus:ui-outline-none focus:ui-ring-2 focus:ui-ring-primary-400 focus:ui-ring-opacity-40 [&[data-state=open]>svg]:ui-rotate-180',
          props?.className
        )}
        ref={ref}
      >
        {props.children}
        <ChevronDownIcon
          className="ui-h-4 ui-w-4 ui-transition-transform ui-duration-200"
          aria-hidden
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(function AccordionContent(props, ref) {
  return (
    <AccordionPrimitive.Content
      {...props}
      className={cx(
        'ui-overflow-hidden ui-text-sm ui-text-gray-700 ui-transition-all data-[state=closed]:ui-animate-accordion-up data-[state=open]:ui-animate-accordion-down'
      )}
      ref={ref}
    >
      <div className={cx('ui-p-3', props.className)}>{props.children}</div>
    </AccordionPrimitive.Content>
  )
})
