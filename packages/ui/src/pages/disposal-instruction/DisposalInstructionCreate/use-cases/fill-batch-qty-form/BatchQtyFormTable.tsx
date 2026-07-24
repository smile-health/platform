import { DataTable } from '#components/data-table'

import { useBatchQtyFormTable } from './useBatchQtyFormTable'

export const BatchQtyFormTable = () => {
  const batchQtyFormTable = useBatchQtyFormTable()

  return (
    <DataTable
      data={batchQtyFormTable.data}
      columns={batchQtyFormTable.columns}
      isStriped
      isHighlightedOnHover
    />
  )
}
