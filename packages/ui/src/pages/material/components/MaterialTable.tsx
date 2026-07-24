import { DataTable } from '#components/data-table'
import { CommonType } from '#types/common'
import { useTranslation } from 'react-i18next'

import {
  columnsMaterialGlobal,
  columnsMaterialProgram,
} from '../constants/table'
import { useMaterialTable } from '../hooks/useMaterialTable'

type MaterialTableProps = CommonType & {
  isLoading?: boolean
  isGlobal?: boolean
  size?: number
  page?: number
}

export default function MaterialTable({
  isLoading,
  isGlobal,
  size,
  page,
}: MaterialTableProps) {
  const { t } = useTranslation(['common', 'material'])

  const {
    sorting,
    setSorting,
    globalDataSource,
    programDataSource,
    materialTypes,
  } = useMaterialTable({
    isGlobal,
  })

  return (
    <div className="ui-space-y-6">
      {isGlobal ? (
        <DataTable
          data={globalDataSource?.data}
          columns={columnsMaterialGlobal(t, {
            page: page ?? 1,
            size: size ?? 10,
            materialTypes: materialTypes,
          })}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading}
        />
      ) : (
        <DataTable
          data={programDataSource?.data}
          columns={columnsMaterialProgram(t, {
            page: page ?? 1,
            size: size ?? 10,
            materialTypes: materialTypes,
          })}
          sorting={sorting}
          setSorting={setSorting}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}
