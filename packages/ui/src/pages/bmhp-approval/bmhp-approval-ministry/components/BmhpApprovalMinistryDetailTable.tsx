import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { TBmhpApprovalMinistryItem } from '../libs/bmhp-approval-ministry.type'

// ── Types ────────────────────────────────────────────────────────────────────────

export type DetailTableColumn<T = any> = {
  key: string
  label: string
  labelKey?: string
  width?: number
  render?: (value: any, row: T, index: number) => React.ReactNode
  className?: string | ((row: T) => string)
}

export type DetailTableProps<T = any> = {
  columns: DetailTableColumn<T>[]
  data?: T[]
  locale?: string
}

// ── Helper: Convert DetailTableColumn to ColumnDef ───────────────────────────────

const convertToColumnDef = <T,>(
  columns: DetailTableColumn<T>[],
  locale: string = 'id'
): ColumnDef<T>[] => {
  const { t } = useTranslation(['bmhpApproval'])

  return columns.map((col) => ({
    accessorKey: col.key,
    header: col.labelKey ? t(col.labelKey as any, { defaultValue: col.label }) : col.label,
    size: col.width,
    enableSorting: false,
    meta: {
      cellClassName: col.className,
    },
    cell: col.render
      ? ({ row, getValue }) => {
          const value = getValue()
          return col.render!(value, row.original, row.index)
        }
      : ({ getValue }) => {
          const value = getValue()
          return value ?? '-'
        },
  }))
}

// ── Detail Table Column Generator ────────────────────────────────────────────────

export const getBmhpApprovalMinistryDetailTableColumn = <T,>({
  locale,
  columns,
}: {
  locale?: string
  columns: DetailTableColumn<T>[]
}): ColumnDef<T>[] => {
  return convertToColumnDef(columns, locale)
}

// ── Default Detail Table Columns Example ─────────────────────────────────────────

export const getDefaultDetailTableColumns = (): DetailTableColumn<TBmhpApprovalMinistryItem>[] => [
  {
    key: 'province_name',
    label: 'Nama Provinsi',
    labelKey: 'bmhpApproval:ministry.table.province_name',
    width: 200,
  },
  {
    key: 'status',
    label: 'Status',
    labelKey: 'bmhpApproval:ministry.table.submission_status',
    width: 150,
    render: (value, row) => {
      const isSubmitted = row.status === 1
      return isSubmitted ? 'Dikirim' : 'Belum Dikirim'
    },
  },
  {
    key: 'submitted_at',
    label: 'Tanggal Kirim',
    labelKey: 'bmhpApproval:ministry.table.submission_date',
    width: 180,
    render: (value, row, index) => {
      const locale = 'id'
      if (!row.submitted_at) return '-'
      return dayjs(row.submitted_at).locale(locale).format('DD MMM YYYY, HH:mm')
    },
  },
]
