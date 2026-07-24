'use client'

import {
  forwardRef,
  Fragment,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/solid'
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  Row,
  RowData,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { EmptyState } from '#components/empty-state'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import DataTableLoader from './DataTableLoader'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    hidden?: boolean | null
    headerClassName?: string
    footerClassName?: string
    cellClassName?: string | ((row: Row<TData>) => string)
    headerSubComponent?: React.ReactNode
    rowSpan?: number | ((row: Row<TData>) => number)
  }
}

export type DataTableProps<Value> = {
  columns: ColumnDef<Value>[]
  data?: Value[]
  isLoading?: boolean
  isSticky?: boolean
  isStickyFooter?: boolean
  isStriped?: boolean
  isHighlightedOnHover?: boolean
  withBorder?: boolean
  withBorderRight?: boolean
  withColspan?: boolean
  className?: string
  bodyClassName?: string
  firstRowClassName?: string
  id?: string
  renderSubComponent?: (props: { row: Row<Value> }) => React.ReactNode
  handleExpand?: (row: Row<Value>) => boolean
  expandOptions?: { single: boolean; id: string }
  onClickRow?: (row: Row<Value>) => void
  withDropdownSelect?: boolean
  withCustomRow?: boolean
  customRow?: React.ReactNode
  emptyDescription?: string
  emptyTitle?: string
  emptyIcon?: ReactNode
  sorting?: SortingState
  setSorting?: (sorting: SortingState) => void
  withHeader?: boolean
  withFooter?: boolean
  rowSelection?: Record<string, boolean>
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  onSelectionChange?: (selectedData: any[]) => void
  stickyColumns?: number[]
  customEmptyComponent?: React.ReactNode
  getRowId?: (row: any, index: number) => string
}

export const DataTable = forwardRef<HTMLDivElement, DataTableProps<any>>(
  (
    {
      columns = [],
      data = [],
      isLoading = false,
      isSticky = false,
      isStickyFooter = false,
      isStriped = false,
      isHighlightedOnHover = false,
      withBorder = true,
      withBorderRight = false,
      withColspan = false,
      className = '',
      firstRowClassName = '',
      bodyClassName = '',
      id = 'dataTable',
      renderSubComponent,
      handleExpand = () => true,
      onClickRow,
      expandOptions,
      withDropdownSelect = false,
      withCustomRow = false,
      customRow,
      sorting,
      setSorting,
      emptyDescription,
      emptyTitle,
      emptyIcon,
      withHeader = true,
      withFooter,
      rowSelection,
      setRowSelection,
      onSelectionChange,
      stickyColumns = [],
      customEmptyComponent,
      getRowId,
    }: DataTableProps<unknown>,
    ref
  ) => {
    const { t } = useTranslation('common')

    const [expanded, setExpanded] = useState<ExpandedState>({})

    const memoizedFlexRender = useMemo(() => flexRender, [])

    const table = useReactTable({
      data,
      columns,
      state: {
        sorting,
        expanded,
        rowSelection,
      },
      manualSorting: true,
      sortDescFirst: false,
      getRowCanExpand: handleExpand,
      onExpandedChange: expandOptions?.single ? undefined : setExpanded,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      onSortingChange: setSorting,
      defaultColumn: {
        size: 0,
        cell: ({ getValue }) => getValue() ?? '-',
      },
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
      getRowId: getRowId
        ? (row: unknown, index: number) => getRowId(row, index)
        : (row: unknown) => (row as any).id?.toString(),
    })

    useEffect(() => {
      const setExpandedState = () => {
        if (expandOptions?.single)
          setExpanded(expandOptions.id ? { [expandOptions.id]: true } : {})
      }
      setExpandedState()
    }, [expandOptions])

    useEffect(() => {
      if (onSelectionChange) {
        const selected = table.getSelectedRowModel().rows.map((r) => r.original)
        onSelectionChange(selected)
      }
    }, [rowSelection])

    const visibleColumns = table.getVisibleLeafColumns()

    const stickyMap = useMemo(() => {
      const totalCols = visibleColumns.length
      const lastIdx = totalCols - 1
      const indices = stickyColumns
        .filter((i) => i >= 0 && i < totalCols)
        .sort((a, b) => a - b)
      const widths = visibleColumns.map(
        (col) => (col.getSize?.() as number) || 0
      )
      let leftOffsets: Record<number, number> = {}
      let acc = 0
      indices.forEach((idx) => {
        if (idx === lastIdx) return
        leftOffsets[idx] = acc
        acc += widths[idx] || 0
      })
      return { lastIdx, leftOffsets }
    }, [stickyColumns, visibleColumns])

    const stickySet = useMemo(() => new Set(stickyColumns), [stickyColumns])

    const isEmpty = data.length === 0

    const EmptyComponent = () => {
      if (customEmptyComponent) return customEmptyComponent

      return (
        <EmptyState
          title={emptyTitle ?? t('message.empty.title')}
          description={emptyDescription ?? t('message.empty.description')}
          emptyIcon={emptyIcon}
          withIcon
        />
      )
    }

    return (
      <div
        className={cx('ui-overflow-hidden ui-relative ui-isolate', {
          'ui-border ui-border-neutral-300 ui-rounded': withBorder,
        })}
      >
        <div ref={ref} id={id} className={cx('ui-overflow-x-auto', className)}>
          <table className="ui-w-full" style={{ minWidth: 'max-content' }}>
            {withHeader && (
              <thead
                className={cx('ui-bg-slate-100', {
                  'ui-sticky ui-top-0 ui-z-10':
                    // ui-outline ui-outline-1 ui-outline-gray-300
                    isSticky,
                })}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    data-testid={`${id}-header-row-${headerGroup.id}`}
                  >
                    {headerGroup.headers.map((header, idx) => {
                      const minSize = header.column.columnDef.minSize
                      const size = header.column.columnDef.size
                      const maxSize = header.column.columnDef.maxSize
                      const headerSubComponent =
                        header.column.columnDef.meta?.headerSubComponent
                      const sortable = Boolean(
                        header.column.columnDef.enableSorting
                      )

                      if (header.column.columnDef.meta?.hidden) return null

                      return (
                        <th
                          key={header.id}
                          id={header.id}
                          colSpan={withColspan ? header.colSpan : 0}
                          data-testid={`${id}-header-${header.id}`}
                          className={cx(
                            'ui-px-2 ui-py-5 ui-text-left ui-text-sm ui-text-dark-blue ui-border-b ui-border-gray-300 ui-font-semibold ui-space-y-1',
                            {
                              'hover:ui-bg-gray-200 ui-cursor-pointer':
                                sortable,
                            },
                            {
                              'ui-border-r': withBorderRight,
                            },
                            Boolean(stickyColumns.length) &&
                            !stickyColumns.includes(idx) &&
                            !stickySet.has(idx + 1) &&
                            '',
                            stickyColumns.includes(idx)
                              ? idx === 0
                                ? 'ui-sticky ui-left-0 ui-z-20 ui-bg-slate-100'
                                : idx === stickyMap.lastIdx
                                  ? 'ui-sticky ui-right-0 ui-z-20 ui-bg-slate-100'
                                  : 'ui-sticky ui-left-0 ui-z-20 ui-bg-slate-100 '
                              : '',
                            header.column.columnDef.meta?.headerClassName
                          )}
                          onClick={
                            sortable
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                          style={{
                            ...(minSize && { minWidth: `${minSize}px` }),
                            width: minSize && size !== 0 ? `${size}px` : 'auto',
                            ...(maxSize && { maxWidth: `${maxSize}px` }),
                            ...(stickyColumns.includes(idx) &&
                              idx !== stickyMap.lastIdx &&
                              !stickySet.has(idx + 1)
                              ? {
                                left: `${stickyMap.leftOffsets[idx] ?? 0}px`,
                                boxShadow:
                                  'inset -1px 0 0 0 rgba(203,213,225,1)',
                              }
                              : {}),
                            ...(stickyColumns.includes(idx) &&
                              idx === stickyMap.lastIdx
                              ? {
                                right: 0,
                                boxShadow:
                                  'inset 1px 0 0 0 rgba(203,213,225,1)',
                              }
                              : {}),
                          }}
                        >
                          <div
                            className={cx({
                              'ui-grid ui-grid-cols-[1fr_16px] ui-gap-2':
                                sortable,
                            })}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            {{
                              asc: <ArrowDownIcon />,
                              desc: <ArrowUpIcon />,
                            }[header.column.getIsSorted() as string] ??
                              (sortable && (
                                <ArrowsUpDownIcon className="ui-w-4" />
                              ))}
                          </div>
                          {headerSubComponent}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
            )}
            <tbody className={`ui-relative ${bodyClassName}`}>
              {isEmpty && !withDropdownSelect ? (
                <tr data-testid={`${id}-empty-row`}>
                  <td
                    colSpan={table.getAllColumns().length}
                    className={cx(
                      'ui-w-full ui-text-dark-blue',
                      bodyClassName,
                      {
                        'ui-h-96': !bodyClassName,
                      }
                    )}
                  >
                    {isLoading ? null : <EmptyComponent />}
                  </td>
                </tr>
              ) : null}

              {!isEmpty &&
                table.getRowModel().rows.map((row) => {
                  const isLastRow = row.index === data.length - 1
                  return (
                    <Fragment key={row.id}>
                      <tr
                        data-testid={`${id}-row-${row.id}`}
                        onClick={() => onClickRow?.(row)}
                        className={cx('even:bg-light group', {
                          'odd:ui-bg-gray-50': isStriped,
                          ' hover:ui-bg-gray-100':
                            onClickRow || isHighlightedOnHover,
                          'ui-cursor-pointer': onClickRow,
                          'ui-border-b-[1px] ui-border-gray-300':
                            withDropdownSelect,
                          [firstRowClassName]:
                            row.index === 0 && firstRowClassName,
                        })}
                      >
                        {row.getVisibleCells().map((cell, idx) => {
                          const cellClassName =
                            cell.column.columnDef?.meta?.cellClassName
                          const rowSpan =
                            typeof cell.column.columnDef?.meta?.rowSpan ===
                              'function'
                              ? cell.column.columnDef.meta.rowSpan(cell.row)
                              : (cell.column.columnDef?.meta?.rowSpan ?? 1)

                          if (cell.column.columnDef.meta?.hidden) return null

                          return (
                            <td
                              key={cell.id}
                              data-testid={`${id}-cell-${cell.id}`}
                              rowSpan={rowSpan}
                              className={cx(
                                'ui-px-2 ui-py-3 ui-align-top',
                                'ui-text-left ui-leading-tight ui-text-dark-blue ui-text-sm',
                                'group-data-[selected=true]:first:ui-border-l-[3px] group-data-[selected=true]:first:ui-border-l-primary-500',
                                {
                                  'ui-border-b ui-border-gray-300': !isLastRow || (isLastRow && withFooter),
                                },
                                {
                                  'ui-border-r': withBorderRight,
                                },
                                Boolean(stickyColumns.length) &&
                                !stickyColumns.includes(idx) &&
                                !stickyColumns.includes(idx + 1) &&
                                '',
                                stickyColumns.includes(idx)
                                  ? idx === 0
                                    ? 'ui-sticky ui-left-0 ui-bg-white ui-z-20'
                                    : idx === row.getVisibleCells().length - 1
                                      ? 'ui-sticky ui-right-0 ui-bg-white ui-z-20'
                                      : 'ui-sticky ui-left-0 ui-bg-white ui-z-20'
                                  : '',
                                typeof cellClassName === 'function'
                                  ? cellClassName(row)
                                  : cellClassName
                              )}
                              style={{
                                ...(stickyColumns.includes(idx) &&
                                  idx !== stickyMap.lastIdx &&
                                  !stickyColumns.includes(idx + 1)
                                  ? {
                                    left: `${stickyMap.leftOffsets[idx] ?? 0}px`,
                                    boxShadow:
                                      'inset -1px 0 0 0 rgba(203,213,225,1)',
                                  }
                                  : {}),
                                ...(stickyColumns.includes(idx) &&
                                  idx === stickyMap.lastIdx
                                  ? {
                                    right: 0,
                                    boxShadow:
                                      'inset 1px 0 0 0 rgba(203,213,225,1)',
                                  }
                                  : {}),
                              }}
                            >
                              {memoizedFlexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          )
                        })}
                      </tr>
                      {row.getIsExpanded() && renderSubComponent && (
                        <tr data-testid={`${id}-sub-row-${row.id}`}>
                          <td
                            data-testid={`${id}-sub-cell-${row.id}`}
                            colSpan={row.getVisibleCells().length}
                          >
                            {renderSubComponent({ row })}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
            </tbody>
            {withFooter && (
              <tfoot
                className={cx('ui-bg-slate-100', {
                  'ui-sticky ui-bottom-[-1px] ui-z-10': isStickyFooter,
                })}
              >
                {table.getFooterGroups().map((footerGroup) => (
                  <tr key={footerGroup.id}>
                    {footerGroup.headers.map((header, idx) => (
                      <th
                        key={header.id}
                        className={cx(
                          'ui-px-2 ui-py-5 ui-text-left ui-text-sm ui-text-dark-blue ui-border-b ui-border-gray-300 ui-font-semibold ui-space-y-1',
                          {
                            'ui-border-r': withBorderRight,
                          },
                          Boolean(stickyColumns.length) &&
                          !stickyColumns.includes(idx) &&
                          !stickySet.has(idx + 1) &&
                          '',
                          stickyColumns.includes(idx)
                            ? idx === 0
                              ? 'ui-sticky ui-left-0 ui-z-20 ui-bg-slate-100'
                              : idx === stickyMap.lastIdx
                                ? 'ui-sticky ui-right-0 ui-z-20 ui-bg-slate-100'
                                : 'ui-sticky ui-left-0 ui-z-20 ui-bg-slate-100 '
                            : '',
                          header.column.columnDef.meta?.footerClassName
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                      </th>
                    ))}
                  </tr>
                ))}
              </tfoot>
            )}
            {withCustomRow && customRow}
          </table>
        </div>
        {isLoading && (
          <div>
            <DataTableLoader />
          </div>
        )}
      </div>
    )
  }
)

DataTable.displayName = 'DataTable'
