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
        <ol className="ui:flex ui:items-center">{children}</ol>
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
        'ui:group ui:inline-flex ui:items-center ui:hover:cursor-pointer',
        'ui:text-neutral-500 ui:last:text-dark-blue ui:last:font-bold ui:last:pointer-events-none'
      )}
    >
      <Component
        {...props}
        className="ui:hover:text-primary-700 ui:hover:underline"
      >
        <Slottable>{children}</Slottable>
      </Component>
      <div className="ui:pointer-events-none ui:mx-1 ui:group-last:hidden">
        {separator}
      </div>
    </li>
  )
}
