'use client'

import React, { createContext, useContext, useMemo } from 'react'
import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/solid'
import { Spinner } from '#components/spinner'
import cx from '#lib/cx'
import { AnimatePresence, motion } from 'framer-motion'

export type VerticalAlignment = 'top' | 'center' | 'bottom'

type SortParams = {
  column?: string
  direction?: string
}

type ProviderParams = {
  loading: boolean
  withColumnBorders: boolean
  striped: boolean
  hightlightOnHover: boolean
  stickyHeader: boolean
  stickyOffset: number
  empty: boolean
  sort?: SortParams
  onChangeSort?: (params: SortParams) => void
  verticalAlignment: VerticalAlignment
}

const TableCtx = createContext<ProviderParams>({
  loading: false,
  withColumnBorders: false,
  striped: false,
  hightlightOnHover: false,
  stickyHeader: false,
  stickyOffset: 0,
  empty: false,
  sort: {
    column: '',
    direction: 'asc',
  },
  verticalAlignment: 'top',
})

export function TableEmpty({
  children,
  colSpan = 999,
  className,
}: {
  children: React.ReactNode
  colSpan?: number
  className?: string
}) {
  const { empty, loading } = useContext(TableCtx)
  return empty ? (
    <tbody>
      <tr>
        <td colSpan={colSpan} className={cx('ui-h-96 ui-w-full', className)}>
          {loading ? null : children}
        </td>
      </tr>
    </tbody>
  ) : null
}

type ThProps = React.ComponentProps<'th'> & {
  children: React.ReactNode
  className?: string
  columnKey?: string
  sortable?: boolean
  style?: React.CSSProperties
}

export function Th({
  children,
  className,
  columnKey,
  sortable,
  style,
  ...props
}: ThProps) {
  const { withColumnBorders, stickyHeader, stickyOffset, sort, onChangeSort } =
    useContext(TableCtx)

  if (sortable === true && columnKey === undefined) {
    throw new Error('columnKey must be provided when sortable is true')
  }

  function toggleSort() {
    if (!sortable || !columnKey) {
      return
    }

    const currentDirection = sort?.direction

    let nextDirection = ''
    if (currentDirection === 'asc') {
      nextDirection = 'desc'
    }

    if (currentDirection === 'desc') {
      nextDirection = ''
    }

    if (!currentDirection) {
      nextDirection = 'asc'
    }
    onChangeSort?.({
      column: nextDirection ? columnKey : '',
      direction: nextDirection,
    })
  }

  return (
    <th
      {...props}
      className={cx(
        'ui-px-2 ui-py-5',
        'ui-text-left ui-text-sm ui-font-medium ui-text-gray-700',
        'ui-border-b ui-border-gray-300',
        {
          '[&:not(:last-child)]:ui-border-r': withColumnBorders,
          'sticky': stickyHeader,
        },
        {
          'ui-cursor-pointer hover:ui-bg-gray-50': sortable,
        },
        className
      )}
      style={{
        top: stickyHeader ? 0 + stickyOffset : undefined,
        ...style,
      }}
      onClick={toggleSort}
    >
      <div className="ui-flex ui-items-center ui-justify-between ui-space-x-3">
        <div className="ui-w-full">{children}</div>
        {sortable ? (
          <div>
            {sort?.column !== columnKey ? (
              <ArrowsUpDownIcon className="ui-h-3.5 ui-w-3.5 ui-text-gray-400"></ArrowsUpDownIcon>
            ) : null}

            {sort?.column === columnKey && sort?.direction === 'asc' ? (
              <ArrowUpIcon className="ui-h-3.5 ui-w-3.5"></ArrowUpIcon>
            ) : null}

            {sort?.column === columnKey && sort?.direction === 'desc' ? (
              <ArrowDownIcon className="ui-h-3.5 ui-w-3.5"></ArrowDownIcon>
            ) : null}
          </div>
        ) : null}
      </div>
    </th>
  )
}

export function Td({
  className,
  children,
  ...props
}: React.ComponentProps<'td'>) {
  const { withColumnBorders, verticalAlignment } = useContext(TableCtx)
  return (
    <td
      {...props}
      className={cx(
        'ui-px-2 ui-py-3',
        'ui-text-left ui-leading-tight ui-text-dark-blue',
        'ui-border-t ui-border-gray-300 group-[:first-of-type]:ui-border-t-0 ',
        //selected style
        'group-data-[selected=true]:first:ui-border-l-[3px] ',
        'group-data-[selected=true]:first:ui-border-l-primary-500',
        {
          '[&:not(:last-child)]:ui-border-r': withColumnBorders,
          'ui-align-top': verticalAlignment === 'top',
          'ui-align-middle': verticalAlignment === 'center',
          'ui-align-bottom': verticalAlignment === 'bottom',
        },
        className
      )}
    >
      {children}
    </td>
  )
}

type TrProps = React.ComponentProps<'tr'> & { selected?: boolean }
export function Tr({ children, selected, className, ...props }: TrProps) {
  const { striped, hightlightOnHover } = useContext(TableCtx)
  return (
    <tr
      {...props}
      data-selected={selected}
      className={cx(
        'hover:ui-cursor-default ui-group',
        {
          'hover:ui-bg-blue-50': hightlightOnHover,
          'odd:ui-bg-gray-100': striped,
          'ui-bg-primary-50 hover:ui-bg-primary-100': selected,
        },
        className
      )}
    >
      {children}
    </tr>
  )
}

function Loading({ show }: { readonly show?: boolean }) {
  return (
    <AnimatePresence>
      {show ? (
        <div className="ui-absolute ui-inset-0 ui-flex ui-justify-center">
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.4,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, ease: 'easeIn' },
            }}
            className={cx(
              'ui-absolute ui-inset-0',
              'ui-bg-white',
              'ui-flex ui-h-full ui-w-full ui-justify-center'
            )}
          ></motion.div>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
              transition: { duration: 0.2, ease: 'easeOut' },
            }}
            exit={{
              opacity: 0,
              transition: { duration: 0.15, ease: 'easeIn' },
            }}
            className="ui-z-10 ui-my-auto ui-h-8 ui-w-8 ui-text-primary-500 ui-opacity-100"
          >
            <Spinner />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

export function Thead({
  className,
  children,
  ...props
}: React.ComponentProps<'thead'>) {
  const currentCtxValue = useContext(TableCtx)
  const value = useMemo(() => {
    return {
      ...currentCtxValue,
      // th inside thead always striped = false and highlightOnHover = false
      striped: false,
      hightlightOnHover: false,
    }
  }, [currentCtxValue])

  return (
    <TableCtx.Provider value={value}>
      <thead {...props} className={cx('ui-bg-slate-100', className)}>
        {children}
      </thead>
    </TableCtx.Provider>
  )
}

export function Tbody({
  className,
  children,
  ...props
}: React.ComponentProps<'tbody'>) {
  const { empty } = useContext(TableCtx)
  if (empty) {
    return null
  }
  return (
    <tbody {...props} className={className}>
      {children}
    </tbody>
  )
}

type TableProos = {
  withBorder?: boolean
  children?: React.ReactNode
  loading?: boolean
  withColumnBorders?: boolean
  striped?: boolean
  hightlightOnHover?: boolean
  stickyHeader?: boolean
  empty?: boolean
  overflowXAuto?: boolean
  layout?: 'fixed' | 'auto'
  sort?: SortParams
  onChangeSort?: (params: SortParams) => void
  verticalAlignment?: VerticalAlignment
  rounded?: boolean
  stickyOffset?: number
}

export function Table({
  withBorder = false,
  children,
  loading = false,
  withColumnBorders = false,
  striped = false,
  hightlightOnHover = false,
  stickyHeader = false,
  stickyOffset = 0,
  empty = false,
  overflowXAuto = true,
  layout = 'auto',
  sort,
  onChangeSort,
  verticalAlignment = 'top',
  rounded,
}: Readonly<TableProos>) {
  const value = useMemo(() => {
    return {
      loading,
      withColumnBorders,
      striped,
      hightlightOnHover,
      stickyHeader,
      stickyOffset,
      empty,
      sort,
      onChangeSort,
      verticalAlignment,
    }
  }, [
    loading,
    withColumnBorders,
    striped,
    hightlightOnHover,
    stickyHeader,
    stickyOffset,
    empty,
    sort,
    onChangeSort,
    verticalAlignment,
  ])

  if (stickyHeader && overflowXAuto) {
    return (
      <div className="ui-border ui-border-red-300 ui-bg-red-50 ui-p-2">
        <span className="ui-font-semibold">stickyHeader</span> and{' '}
        <span className="ui-font-semibold">overflowXAuto</span> cannot true at
        the same time
      </div>
    )
  }

  if (stickyHeader && rounded) {
    return (
      <div className="ui-border ui-border-red-300 ui-bg-red-50 ui-p-2">
        <span className="ui-font-semibold">stickyHeader</span> and{' '}
        <span className="ui-font-semibold">rounded</span> cannot true at the
        same time
      </div>
    )
  }

  return (
    <TableCtx.Provider value={value}>
      <div className="ui-relative ui-isolate ui-w-full">
        <div
          className={cx('ui-relative ui-w-full', {
            'ui-overflow-x-auto': overflowXAuto,
            'ui-border ui-border-gray-300': withBorder,
            'ui-rounded-md': rounded,
          })}
        >
          <table
            className={cx(
              'ui-relative ui-w-full ui-tabular-nums',
              'ui-border-separate ui-border-spacing-0',
              {
                'ui-table-fixed': layout === 'fixed',
                'ui-table-auto': layout === 'auto',
              }
            )}
          >
            {children}
          </table>
        </div>

        <Loading show={loading}></Loading>
      </div>
    </TableCtx.Provider>
  )
}
