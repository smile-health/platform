'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import cx from '#lib/cx'

type BreadcrumbProps = {
  children?: React.ReactNode
  separator?: React.ReactNode
}
const BreadcrumbCtx = createContext<BreadcrumbProps>({})

export function Breadcrumb({
  children,
  separator = '/',
}: Readonly<BreadcrumbProps>) {
  const value = useMemo(() => ({ separator }), [separator])

  return (
    <BreadcrumbCtx.Provider value={value}>
      <nav aria-label="breadcrumb">
        <ol className="ui-flex ui-items-center">{children}</ol>
      </nav>
    </BreadcrumbCtx.Provider>
  )
}

export function BreadcrumbItem({
  children,
  asChild,
  ...props
}: Readonly<{
  children: React.ReactNode
  asChild?: boolean
}>) {
  const { separator } = useContext(BreadcrumbCtx)
  const Component = asChild ? Slot : 'button'
  return (
    <li
      className={cx(
        'ui-group ui-inline-flex ui-items-center hover:ui-cursor-pointer',
        'ui-text-neutral-500 last:ui-text-dark-blue last:ui-font-bold last:ui-pointer-events-none'
      )}
    >
      <Component
        {...props}
        className="hover:ui-text-primary-700 hover:ui-underline"
      >
        <Slottable>{children}</Slottable>
      </Component>
      <div className="ui-pointer-events-none ui-mx-1 group-last:ui-hidden">
        {separator}
      </div>
    </li>
  )
}
