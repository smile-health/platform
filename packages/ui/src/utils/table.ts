import {
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createSortedRowModel,
  rowExpandingFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
} from '@tanstack/react-table'
import type {
  CellData,
  CellContext as TanstackCellContext,
  ColumnDef as TanstackColumnDef,
  HeaderContext as TanstackHeaderContext,
  Row as TanstackRow,
  RowData,
  Table as TanstackTable,
} from '@tanstack/react-table'

/**
 * Fitur react-table v9 yang dipakai semua tabel di aplikasi ini.
 *
 * v9 mewajibkan fitur didaftarkan per tabel dan tipe `ColumnDef`, `Row`,
 * `CellContext`, dst. membawa generic fitur di depan. Modul ini mengunci
 * set fitur itu sekali, lalu mengekspor ulang tipenya dengan nama dan arity
 * yang sama seperti v8, jadi definisi kolom cukup ganti path import.
 */
export const appTableFeatures = tableFeatures({
  rowSortingFeature,
  rowExpandingFeature,
  rowSelectionFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  expandedRowModel: createExpandedRowModel(),
})

export type AppTableFeatures = typeof appTableFeatures

export type ColumnDef<
  TData extends RowData,
  TValue extends CellData = any,
> = TanstackColumnDef<AppTableFeatures, TData, TValue>

export type Row<TData extends RowData> = TanstackRow<AppTableFeatures, TData>

export type CellContext<
  TData extends RowData,
  TValue extends CellData = any,
> = TanstackCellContext<AppTableFeatures, TData, TValue>

export type HeaderContext<
  TData extends RowData,
  TValue extends CellData = any,
> = TanstackHeaderContext<AppTableFeatures, TData, TValue>

export type Table<TData extends RowData> = TanstackTable<
  AppTableFeatures,
  TData
>

export type {
  ColumnSort,
  ExpandedState,
  RowData,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table'
export { functionalUpdate } from '@tanstack/react-table'
