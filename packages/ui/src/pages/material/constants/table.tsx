import { CellContext, ColumnDef } from '@tanstack/react-table'
import { ButtonActionTable } from '#components/modules/ButtonActionTable'
import { TMaterial, TMaterialList } from '#types/material'
import { formatToCelcius } from '#utils/strings'
import { isViewOnly } from '#utils/user'
import { TFunction } from 'i18next'

import { DEFAULT_VALUE } from '../utils/material.constants'

type TSelection = {
  value: number
  label: string
}

type DataProps = {
  page: number
  size: number
  materialTypes?: TSelection[]
}

export const columnsMaterialGlobal = (
  t: TFunction<['common', 'material']>,
  { page, size, materialTypes }: DataProps
): ColumnDef<TMaterialList>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('material:list.column.material_name'),
    accessorKey: 'name',
    id: 'name',
    size: 450,
    enableSorting: true,
    cell: ({ row: { original } }) => original.name ?? '-',
  },
  {
    header: t('material:list.column.material_type'),
    accessorKey: 'material_type',
    id: 'material_type',
    size: 100,
    enableSorting: true,
    cell: ({ row: { original } }) =>
      materialTypes?.find((x) => x?.value === original.material_type_id)
        ?.label ?? '-',
  },
  {
    header: 'Program',
    accessorKey: 'program',
    id: 'program',
    size: 100,
    cell: ({ row: { original } }: CellContext<TMaterialList, string>) => {
      const programs = original.programs?.map((item) => item?.name).join(', ')
      return programs ?? '-'
    },
  },
  {
    header: t('material:list.column.material_level.label'),
    accessorKey: 'material_level',
    id: 'material_level',
    size: 120,
    enableSorting: true,
    cell: ({ row: { original } }: CellContext<TMaterialList, string>) => {
      if (original?.hierarchy_code) {
        return original?.material_level_id === 2
          ? t('material:list.column.material_level.kfa_92')
          : t('material:list.column.material_level.kfa_93')
      } else {
        return t('material:list.column.material_level.non_hierarchy')
      }
    },
  },
  {
    header: t('material:list.column.managed_by_batch'),
    accessorKey: 'managed_in_batch',
    id: 'managed_in_batch',
    size: 200,
    enableSorting: true,
    cell: ({ row: { original } }: CellContext<TMaterialList, string>) => {
      return original?.is_managed_in_batch === DEFAULT_VALUE.YES
        ? t('common:yes')
        : t('common:no')
    },
  },
  {
    header: t('material:list.column.updated_by'),
    accessorKey: 'updated_by',
    id: 'updated_by',
    enableSorting: true,
    size: 160,
    cell: ({ row: { original } }: CellContext<TMaterialList, string>) =>
      `${original?.user_updated_by?.firstname ?? ''} ${original?.user_updated_by?.lastname ?? ''}`,
  },
  {
    header: t('material:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    size: 160,
    cell: ({ row: { original } }) => {
      return (
        <ButtonActionTable
          id={original?.id}
          path={'global-settings/material/data'}
          hidden={['activation']}
        />
      )
    },
  },
]

export const columnsMaterialProgram = (
  t: TFunction<['common', 'material']>,
  { page, size }: DataProps
): ColumnDef<TMaterial>[] => [
  {
    header: 'No.',
    accessorKey: 'no',
    id: 'no',
    size: 50,
    cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
  },
  {
    header: t('material:list.column.material_name'),
    accessorKey: 'name',
    id: 'name',
    size: 500,
    enableSorting: true,
    cell: ({ row: { original } }) => original.name ?? '-',
  },
  {
    header: t('material:list.column.material_type'),
    accessorKey: 'material_type',
    id: 'material_type',
    size: 120,
    enableSorting: true,
    cell: ({ row: { original } }) => original.material_type?.name ?? '-',
  },
  {
    header: t('material:list.column.activity_name'),
    accessorKey: 'managed_by_batch',
    id: 'managed_by_batch',
    size: 350,
    cell: ({ row: { original } }: CellContext<TMaterial, string>) => {
      return original?.material_activities
        ?.map((item) => {
          return item?.name
        })
        .join(', ')
    },
  },
  {
    header: t('material:list.column.min_temperature'),
    accessorKey: 'min_temperature',
    id: 'min_temperature',
    size: 140,
    enableSorting: true,
    cell: ({ row: { original } }: CellContext<TMaterial, string>) =>
      formatToCelcius(original.min_temperature ?? '0'),
  },
  {
    header: t('material:list.column.max_temperature'),
    accessorKey: 'max_temperature',
    id: 'max_temperature',
    size: 140,
    enableSorting: true,
    cell: ({ row: { original } }: CellContext<TMaterial, string>) =>
      formatToCelcius(original.max_temperature ?? '0'),
  },
  {
    header: t('material:list.column.updated_by'),
    accessorKey: 'updated_by',
    id: 'updated_by',
    enableSorting: true,
    size: 120,
    cell: ({ row: { original } }: CellContext<TMaterial, string>) =>
      original?.user_updated_by
        ? `${original?.user_updated_by?.firstname ?? ''} ${original?.user_updated_by?.lastname ?? ''}`
        : '-',
  },
  {
    header: t('material:list.column.action'),
    accessorKey: 'action',
    id: 'action',
    size: 160,
    cell: ({ row: { original } }) => {
      const hiddenActions: Array<'activation' | 'edit' | 'detail'> = [
        'activation',
      ]
      if (isViewOnly()) hiddenActions.push('edit')
      return (
        <ButtonActionTable
          id={original?.id}
          path={'material'}
          hidden={hiddenActions}
        />
      )
    },
  },
]
