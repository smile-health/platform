import { useEffect, useMemo, useState } from 'react'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import BmhpPlanningTitleBlock from '#pages/bmhp/bmhp-planning/list/components/BmhpPlanningTitleBlock'
import dayjs from 'dayjs'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { TBmhpPopulasiData } from '../master.service'

export interface PopulasiTableProps {
  basePath: string
  populationColumns: string[]
}

const renderUpdatedByCell = (item: TBmhpPopulasiData, language: string) => {
  const updatedName = item.user_updated_by
    ? `${item.user_updated_by.firstname} ${item.user_updated_by.lastname}`
    : '-'
  const updatedAtStr = item.user_updated_at
    ? dayjs(item.user_updated_at).locale(language).format('DD MMM YYYY HH:mm')
    : '-'

  return (
    <BmhpPlanningTitleBlock
      arrText={[
        {
          firstLabel: updatedName,
          firstClassName: 'ui-text-sm ui-font-normal ui-text-dark-teal',
        },
        {
          firstLabel: updatedAtStr,
          firstClassName: 'ui-text-sm ui-font-normal ui-text-dark-teal ui-my-1',
        },
      ]}
    />
  )
}

const useMasterTable = (props: PopulasiTableProps) => {
  const { t, i18n } = useTranslation(['common', 'bmhpPlanning'])

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const [querySorting, setQuerySorting] = useQueryStates(
    {
      sort_by: parseAsString.withDefault(''),
      sort_type: parseAsString.withDefault(''),
    },
    {
      history: 'push',
    }
  )

  const [sorting, setSorting] = useState<SortingState>(
    querySorting?.sort_by
      ? [
          {
            desc: querySorting?.sort_type === 'desc',
            id: querySorting?.sort_by,
          },
        ]
      : []
  )

  useEffect(() => {
    setQuerySorting(
      sorting.length
        ? {
            sort_by: sorting[0].id,
            sort_type: sorting[0].desc ? 'desc' : 'asc',
          }
        : { sort_by: null, sort_type: null }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorting])

  const columns: ColumnDef<TBmhpPopulasiData>[] = useMemo(() => {
    const cols: ColumnDef<TBmhpPopulasiData>[] = [
      {
        header: t('table.column.no', 'No'),
        accessorKey: 'number',
        size: 60,
        minSize: 60,
        cell: ({ row }) => {
          return (pagination.page - 1) * pagination.paginate + (row.index + 1)
        },
        meta: {
          cellClassName: 'ui-text-center',
        },
      },
      {
        header: t('bmhpPlanning:table.column.kota_kabupaten', 'Kota/Kabupaten'),
        id: 'location',
        size: 300,
        minSize: 200,
        accessorFn: (row) => row.entity?.name ?? row.entity?.province ?? '-',
        cell: ({ getValue }) => <div>{getValue() as string}</div>,
      },
    ]

    // Create a column for each population type dynamically
    props.populationColumns.forEach((popName) => {
      cols.push({
        header: popName,
        id: `pop_${popName}`,
        enableSorting: false,
        accessorFn: (row) => {
          const pop = row.population.find((p) => p.name === popName)
          return pop ? pop.population_number : 0
        },
        cell: ({ getValue }) => (getValue() as number).toLocaleString('id-ID'),
        meta: {
          cellClassName: 'ui-text-left',
        },
      })
    })

    // Updated by column
    cols.push({
      accessorKey: 'user_updated_at',
      header: t('common:updated_by'),
      meta: {
        cellClassName: 'ui-w-56',
      },
      cell: ({ row }) => renderUpdatedByCell(row.original, i18n.language),
    })

    return cols
  }, [
    t,
    i18n.language,
    pagination.page,
    pagination.paginate,
    props.populationColumns,
  ])

  return {
    columns,
    pagination: {
      page: pagination.page,
      paginate: pagination.paginate,
      update: setPagination,
    },
    querySorting: {
      querySorting,
      setQuerySorting,
    },
    sorting: {
      sorting,
      setSorting,
    },
  }
}

export default useMasterTable
