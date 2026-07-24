import React, { ReactNode } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import {
  DataPair,
  RenderDetailValue,
} from '#components/modules/RenderDetailValue'
import { Skeleton } from '#components/skeleton'

export interface DetailField {
  id?: string
  label: string
  value?: ReactNode
  hidden?: boolean
}

export interface DetailListField {
  id?: string
  label: string
  items: Array<Record<string, any>>
  columns?: ColumnDef<any, any>[]
  renderItem?: (item: any, index: number) => ReactNode
  emptyText?: string
  hidden?: boolean
  className?: string
  tableClassName?: string
}

export interface DetailSectionProps {
  /** Section ID for key */
  id?: string
  /** Section title */
  title: string
  /** Fields to display in label-value format */
  fields: DetailField[]
  /** List fields to display as array/list */
  listFields?: DetailListField[]
  /** Loading state */
  isLoading?: boolean
  /** Additional class name for the section */
  className?: string
  /** Custom header content (right side) */
  headerAction?: ReactNode
  /** Hide colon separator */
  hideColon?: boolean
}

export const DetailSection: React.FC<DetailSectionProps> = ({
  id,
  title,
  fields,
  listFields,
  isLoading = false,
  className = '',
  headerAction,
  hideColon = false,
}) => {
  if (isLoading) {
    return <DetailSectionSkeleton />
  }

  const formattedFields: DataPair[] = fields.map((field) => ({
    id: field.id,
    label: field.label,
    value: field.value,
    hidden: field.hidden,
  }))

  return (
    <div
      id={id}
      className={`ui-border ui-border-neutral-300 ui-rounded ui-p-4 ui-space-y-4 ${className}`}
    >
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-base">{title}</h5>
        {headerAction}
      </div>
      {fields.length > 0 && (
        <RenderDetailValue data={formattedFields} showColon={!hideColon} />
      )}
      {listFields && listFields.length > 0 && (
        <div className="ui-space-y-4">
          {listFields.map((listField) => (
            <DetailListSection
              key={listField.id || listField.label}
              {...listField}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const DetailListSection: React.FC<DetailListField> = ({
  id,
  label,
  items,
  columns,
  renderItem,
  emptyText = 'Tidak ada data',
  hidden = false,
  className = '',
  tableClassName = '',
}) => {
  if (hidden) return null

  // Generate default columns jika tidak disediakan
  const defaultColumns: ColumnDef<any, any>[] = React.useMemo(() => {
    if (!items || items.length === 0) return []

    const firstItem = items[0]
    if (typeof firstItem === 'string' || typeof firstItem === 'number') {
      return [
        {
          id: 'value',
          header: 'Value',
          accessorFn: (row) => row,
          cell: ({ getValue }) => (
            <span className="ui-text-sm">{getValue()}</span>
          ),
        },
      ]
    }

    return Object.keys(firstItem).map((key) => ({
      id: key,
      header: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      accessorKey: key,
      cell: ({ getValue }) => {
        const value = getValue()
        return (
          <span className="ui-text-sm">
            {value !== null && value !== undefined ? String(value) : '-'}
          </span>
        )
      },
    }))
  }, [items])

  // Jika ada custom renderItem, gunakan rendering manual dalam wrapper table-like
  if (renderItem) {
    return (
      <div id={id} className={`ui-space-y-3 ${className}`}>
        <h6 className="ui-font-medium ui-text-sm ui-text-gray-700">{label}</h6>
        {items && items.length > 0 ? (
          <div className="ui-space-y-2">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <div className="ui-border ui-border-neutral-200 ui-rounded ui-p-4 ui-text-center">
            <span className="ui-text-sm ui-text-gray-500">{emptyText}</span>
          </div>
        )}
      </div>
    )
  }

  // Default: gunakan DataTable untuk konsistensi dengan design system
  return (
    <div id={id} className={`ui-space-y-3 ${className}`}>
      <h6 className="ui-font-medium ui-text-sm ui-text-gray-700">{label}</h6>
      <div className={`ui-rounded ${tableClassName}`}>
        <DataTable
          data={items || []}
          columns={columns || defaultColumns}
          isLoading={false}
          emptyDescription={emptyText}
          bodyClassName={items && items.length > 0 ? 'ui-h-auto' : 'ui-h-32'}
          className="ui-border-none"
        />
      </div>
    </div>
  )
}

const DetailSectionSkeleton: React.FC = () => {
  return (
    <div className="ui-border ui-border-neutral-300 ui-rounded ui-p-4 ui-space-y-4">
      <Skeleton className="ui-h-6 ui-w-48" />
      <div className="ui-space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="ui-grid ui-grid-cols-[200px_1fr] ui-gap-4"
          >
            <Skeleton className="ui-h-5 ui-w-32" />
            <Skeleton className="ui-h-5 ui-w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
