import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import cx from '#lib/cx'

type UserSchema = {
  id: number
  name: string
  address: string
  age: number
  phone: string
}

const data: UserSchema[] = [
  {
    id: 1,
    name: 'John Doe',
    address: '123 Main St',
    age: 30,
    phone: '123-456-7890',
  },
  {
    id: 2,
    name: 'Jane Doe',
    address: '456 Elm St',
    age: 25,
    phone: '123-456-7890',
  },
  {
    id: 3,
    name: 'Mike Smith',
    address: '789 Oak St',
    age: 40,
    phone: '123-456-7890',
  },
  {
    id: 4,
    name: 'Sara Smith',
    address: '101 Pine St',
    age: 35,
    phone: '123-456-7890',
  },
  {
    id: 5,
    name: 'Tom Brown',
    address: '202 Maple St',
    age: 45,
    phone: '123-456-7890',
  },
  {
    id: 6,
    name: 'Lisa Brown',
    address: '303 Cedar St',
    age: 35,
    phone: '123-456-7890',
  },
  {
    id: 7,
    name: 'James Johnson',
    address: '404 Walnut St',
    age: 50,
    phone: '123-456-7890',
  },
  {
    id: 8,
    name: 'Mary Johnson',
    address: '505 Birch St',
    age: 55,
    phone: '123-456-7890',
  },
  {
    id: 9,
    name: 'David Lee',
    address: '606 Spruce St',
    age: 60,
    phone: '123-456-7890',
  },
  {
    id: 10,
    name: 'Emily Lee',
    address: '707 Pine St',
    age: 65,
    phone: '123-456-7890',
  },
]
const columns: ColumnDef<UserSchema>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Age',
    accessorKey: 'age',
    maxSize: 100,
    meta: {
      cellClassName: (row) =>
        cx({
          'ui-bg-red-200': row.original.age >= 40,
          'ui-bg-yellow-200': row.original.age >= 30 && row.original.age < 40,
          'ui-bg-green-200': row.original.age < 30,
        }),
      headerClassName: 'ui-italic',
      headerSubComponent: (
        <div className="ui-font-normal ui-text-gray-500">
          Custom Header Sub Component
        </div>
      ),
    },
  },
  {
    header: 'Address',
    accessorKey: 'address',
  },
  {
    header: 'Phone',
    accessorKey: 'phone',
  },
  {
    header: 'Actions',
    accessorKey: 'id',
    size: 400,
    cell: ({ row }) => (
      <div className="space-x-2">
        <Button
          size="sm"
          onClick={() => {
            console.log('Edit', row.original.id)
          }}
        >
          Edit
        </Button>
        <Button
          size="sm"
          onClick={() => {
            console.log('Delete', row.original.id)
          }}
        >
          Delete
        </Button>
      </div>
    ),
  },
]

const DataTablePage = () => {
  return (
    <div className="ui-px-20 p-5">
      <div className="ui-border ui-rounded-lg ui-p-4 ui-space-y-4">
        <div className="ui-font-semibold">Regular Table</div>
        <DataTable
          id="regular-table"
          columns={columns}
          data={data}
          className="ui-h-[400px]"
        />
      </div>
      <div className="ui-border ui-rounded-lg ui-p-4 ui-space-y-4">
        <div className="ui-font-semibold">Sticky & Clickable Table</div>
        <DataTable
          id="sticky-clickable-table"
          columns={columns}
          data={data}
          isSticky
          onClickRow={(row) => console.log({ row })}
          className="ui-h-[400px]"
        />
      </div>
    </div>
  )
}

export default DataTablePage
