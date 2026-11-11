jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
jest.mock('#components/empty-state', () => ({
  EmptyState: ({ title }: { title: string }) => <div>{title}</div>,
}))
jest.mock('../DataTableLoader', () => () => null)

import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import type { ColumnDef, Row, SortingState } from '#utils/table'

import { DataTable } from '../DataTable'

type Item = { id: number; name: string; note: string | null }

const data: Item[] = [
  { id: 1, name: 'Vaksin A', note: 'ok' },
  { id: 2, name: 'Vaksin B', note: null },
]

const columns: ColumnDef<Item>[] = [
  { header: 'Nama', accessorKey: 'name', enableSorting: true },
  { header: 'Catatan', accessorKey: 'note' },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => (
      <>
        <button onClick={() => row.toggleExpanded()}>expand-{row.id}</button>
        <button onClick={() => row.toggleSelected()}>select-{row.id}</button>
        <span>{row.getIsSelected() ? `selected-${row.id}` : ''}</span>
      </>
    ),
  },
]

describe('DataTable (react-table v9)', () => {
  it('merender header, baris, dan default cell "-" untuk nilai null', () => {
    render(<DataTable columns={columns} data={data} />)

    expect(screen.getByText('Nama')).toBeTruthy()
    expect(screen.getByText('Vaksin A')).toBeTruthy()
    expect(screen.getByText('Vaksin B')).toBeTruthy()
    expect(screen.getByTestId('dataTable-row-2')).toBeTruthy()
    expect(screen.getByTestId('dataTable-cell-2_note').textContent).toBe('-')
  })

  it('memanggil setSorting dengan urutan asc lebih dulu saat header sortable diklik', () => {
    const setSorting = jest.fn()
    render(
      <DataTable
        columns={columns}
        data={data}
        sorting={[]}
        setSorting={setSorting}
      />
    )

    fireEvent.click(screen.getByTestId('dataTable-header-name'))

    expect(setSorting).toHaveBeenCalledTimes(1)
    const updater = setSorting.mock.calls[0][0]
    const next: SortingState =
      typeof updater === 'function' ? updater([]) : updater
    expect(next).toEqual([{ id: 'name', desc: false }])
  })

  it('menampilkan sub row setelah baris di-expand', () => {
    const renderSubComponent = ({ row }: { row: Row<Item> }) => (
      <div>detail-{row.original.name}</div>
    )
    render(
      <DataTable
        columns={columns}
        data={data}
        renderSubComponent={renderSubComponent}
      />
    )

    expect(screen.queryByText('detail-Vaksin A')).toBeNull()
    fireEvent.click(screen.getByText('expand-1'))
    expect(screen.getByText('detail-Vaksin A')).toBeTruthy()
    expect(screen.queryByText('detail-Vaksin B')).toBeNull()
  })

  it('menyinkronkan seleksi baris lewat rowSelection dan onSelectionChange', () => {
    const onSelectionChange = jest.fn()
    const Wrapper = () => {
      const [rowSelection, setRowSelection] = useState<
        Record<string, boolean>
      >({})
      return (
        <DataTable
          columns={columns}
          data={data}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          onSelectionChange={onSelectionChange}
        />
      )
    }
    render(<Wrapper />)

    fireEvent.click(screen.getByText('select-2'))

    expect(screen.getByText('selected-2')).toBeTruthy()
    expect(screen.queryByText('selected-1')).toBeNull()
    expect(onSelectionChange).toHaveBeenLastCalledWith([data[1]])
  })

  it('menampilkan empty state saat data kosong', () => {
    render(<DataTable columns={columns} data={[]} />)
    expect(screen.getByText('message.empty.title')).toBeTruthy()
  })
})
