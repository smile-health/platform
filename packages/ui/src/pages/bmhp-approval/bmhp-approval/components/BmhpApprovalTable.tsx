'use client'

import React, { createContext, useContext, useMemo } from 'react'
import { EmptyState } from '#components/empty-state'
import cx from '#lib/cx'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BmhpApprovalTableColumn {
  /** Unique key for this column */
  key: string
  /** Content rendered inside <th> */
  header: React.ReactNode
  /** Extra className applied to <th> */
  headerClassName?: string
  /** Extra className applied to every <td> in this column */
  cellClassName?: string
  /** colSpan for the <th> (header spanning) */
  colSpan?: number
  /** rowSpan for the <th> (vertical spanning across header rows) */
  rowSpan?: number
  /** Min-width in px */
  minWidth?: number
  /** Fixed width in px */
  width?: number
  /**
   * Mark this column as sticky-left. The table auto-calculates the left offset
   * from the cumulative widths of preceding sticky leafColumns — no manual px needed.
   */
  sticky?: boolean
}

export interface BmhpApprovalTableHeaderGroup {
  /** Unique key for this header group row */
  key: string
  columns: BmhpApprovalTableColumn[]
}

export interface BmhpApprovalTableProps<TRow = Record<string, unknown>> {
  headers: BmhpApprovalTableColumn[] | BmhpApprovalTableHeaderGroup[]
  /** Leaf-level columns used for rendering <td> cells (order matters). */
  leafColumns: BmhpApprovalTableColumn[]
  data: TRow[]
  renderRow: (row: TRow, rowIndex: number) => React.ReactNode
  isLoading?: boolean
  withBorder?: boolean
  isStriped?: boolean
  className?: string
  bodyClassName?: string
  emptyTitle?: string
  emptyDescription?: string
  customEmptyComponent?: React.ReactNode
  id?: string
}

// ─── Context (sticky offset map, keyed by column key) ────────────────────────

const StickyCtx = createContext<Record<string, number>>({})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isHeaderGroupArray(
  headers: BmhpApprovalTableColumn[] | BmhpApprovalTableHeaderGroup[]
): headers is BmhpApprovalTableHeaderGroup[] {
  return (
    headers.length > 0 &&
    'columns' in headers[0] &&
    Array.isArray((headers[0] as BmhpApprovalTableHeaderGroup).columns)
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonRow: React.FC<{ colCount: number }> = ({ colCount }) => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: colCount }).map((__, j) => (
          <td key={j} className="ui-px-2 ui-py-3">
            <div className="ui-h-4 ui-rounded ui-bg-neutral-200 ui-animate-pulse" />
          </td>
        ))}
      </tr>
    ))}
  </>
)

// ─── Component ────────────────────────────────────────────────────────────────

function BmhpApprovalTable<TRow = Record<string, unknown>>({
  headers,
  leafColumns,
  data,
  renderRow,
  isLoading = false,
  withBorder = true,
  isStriped = false,
  className,
  bodyClassName,
  emptyTitle = 'No data',
  emptyDescription = 'There are no records to display.',
  customEmptyComponent,
  id = 'bmhpApprovalTable',
}: BmhpApprovalTableProps<TRow>) {
  const isEmpty = data.length === 0

  const headerGroups: BmhpApprovalTableHeaderGroup[] = isHeaderGroupArray(
    headers
  )
    ? headers
    : [{ key: 'default', columns: headers as BmhpApprovalTableColumn[] }]

  // Auto-compute left offsets for all sticky leaf columns
  const stickyOffsets = useMemo<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    let acc = 0
    for (const col of leafColumns) {
      if (col.sticky) map[col.key] = acc
      acc += col.width ?? col.minWidth ?? 0
    }
    return map
  }, [leafColumns])

  return (
    <StickyCtx.Provider value={stickyOffsets}>
      <div
        className={cx('ui-overflow-hidden ui-relative ui-isolate', {
          'ui-border ui-border-neutral-300 ui-rounded': withBorder,
        })}
      >
        <div className={cx('ui-overflow-x-auto', className)}>
          <table
            id={id}
            className="ui-w-full ui-border-separate ui-border-spacing-0"
            style={{ minWidth: 'max-content' }}
          >
            {/* ── THEAD ──────────────────────────────────────────────────── */}
            <thead className="ui-bg-slate-100 ui-sticky ui-top-0 ui-z-10">
              {headerGroups.map((group) => (
                <tr key={group.key}>
                  {group.columns.map((col) => {
                    const leftOffset = stickyOffsets[col.key]
                    const isSticky = leftOffset !== undefined
                    return (
                      <th
                        key={col.key}
                        colSpan={col.colSpan ?? 1}
                        rowSpan={col.rowSpan ?? 1}
                        data-testid={`${id}-header-${col.key}`}
                        className={cx(
                          'ui-px-2 ui-py-5 ui-text-left ui-text-sm ui-text-dark-blue',
                          'ui-border-r ui-border-b ui-border-gray-300 ui-font-semibold',
                          isSticky && 'ui-sticky ui-z-20 ui-bg-slate-100',
                          col.headerClassName
                        )}
                        style={{
                          ...(col.minWidth
                            ? { minWidth: `${col.minWidth}px` }
                            : {}),
                          ...(col.width ? { width: `${col.width}px` } : {}),
                          ...(isSticky ? { left: `${leftOffset}px` } : {}),
                        }}
                      >
                        {col.header}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>

            {/* ── TBODY ──────────────────────────────────────────────────── */}
            <tbody className={cx('ui-relative', bodyClassName)}>
              {isLoading ? (
                <SkeletonRow colCount={leafColumns.length} />
              ) : isEmpty ? (
                <tr data-testid={`${id}-empty-row`}>
                  <td
                    colSpan={leafColumns.length}
                    className="ui-w-full ui-text-dark-blue ui-h-96"
                  >
                    {customEmptyComponent ?? (
                      <EmptyState
                        title={emptyTitle}
                        description={emptyDescription}
                        withIcon
                      />
                    )}
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    data-testid={`${id}-row-${rowIndex}`}
                    className={cx('even:bg-light group', {
                      'odd:ui-bg-gray-50': isStriped,
                    })}
                  >
                    {renderRow(row, rowIndex)}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </StickyCtx.Provider>
  )
}

export default BmhpApprovalTable

// ─── Re-usable <td> helper ───────────────────────────────────────────────────

/**
 * BmhpApprovalTd
 *
 * Use `stickyKey` (matching the leafColumn key) to make this cell sticky-left.
 * The left offset is calculated automatically by the parent BmhpApprovalTable.
 */
export const BmhpApprovalTd: React.FC<
  React.TdHTMLAttributes<HTMLTableCellElement> & {
    /** Column key to look up auto-calculated sticky left offset */
    stickyKey?: string
  }
> = ({ stickyKey, className: cls, style, children, ...props }) => {
  const stickyOffsets = useContext(StickyCtx)
  const leftOffset =
    stickyKey !== undefined ? stickyOffsets[stickyKey] : undefined
  const isSticky = leftOffset !== undefined

  return (
    <td
      className={cx(
        'ui-px-2 ui-py-3 ui-align-top',
        'ui-text-left ui-leading-tight ui-text-dark-blue ui-text-sm',
        'ui-border-r ui-border-b ui-border-gray-300',
        isSticky && 'ui-sticky ui-z-10 ui-bg-white',
        cls
      )}
      style={{
        ...(isSticky ? { left: `${leftOffset}px` } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  )
}
