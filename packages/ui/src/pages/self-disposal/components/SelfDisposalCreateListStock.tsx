import React, { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '#components/checkbox'
import { InfiniteScrollList } from '#components/infinite-scroll-list'
import { numberFormatter } from '#utils/formatter'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { FormData } from '../schema/SelfDisposalFormSchema'
import { listStock } from '../self-disposal.service'
import { Stock } from '../self-disposal.type'
import { KfaLevelEnum } from '#constants/material'

const SelfDisposalCreateListStock = ({
  setOpenConfirmationChange
}: {
  setOpenConfirmationChange: (index: number) => void
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation('selfDisposal')
  const { watch, control } = useFormContext<FormData>()

  const { append } = useFieldArray({
    control,
    name: 'materials',
  })

  const activity = watch('activity')
  const entity = watch('entity')
  const materials = watch('materials')
  const disposal_method = watch('disposal_method')

  const classRow = (qty: number | undefined) => {
    if (Number(qty) === 0) {
      return 'ui-bg-neutral-300 ui-cursor-not-allowed'
    }
    return ''
  }
  const tableSchema: Array<ColumnDef<Stock>> = [
    {
      accessorKey: 'material.name',
      header: t('create.material_table.material_name'),
      meta: {
        cellClassName: ({ original }) =>
          classRow(original?.total_disposal_discard_qty + original?.total_disposal_received_qty),
      },
      cell: ({ row }) => row.original?.material?.name ?? '',
    },
    {
      accessorKey: 'details.total_qty',
      header: t('create.material_table.stock_of_disposal', { value: activity?.label ?? '' }),
      meta: {
        cellClassName: ({ original }) =>
          classRow(original?.total_disposal_discard_qty + original?.total_disposal_received_qty),
      },
      cell: ({ row: { original } }) =>
        numberFormatter(
          Number(original?.total_disposal_discard_qty + original?.total_disposal_received_qty),
          language
        ),
    },
    {
      id: 'selection',
      accessorKey: 'material',
      header: 'Selection',
      meta: {
        cellClassName: ({ original }: any) =>
          classRow(original?.total_disposal_discard_qty + original?.total_disposal_received_qty),
      },
      cell: ({ row: { original } }) => {
        return (
          <div>
            <Checkbox
              disabled={original?.total_disposal_discard_qty + original?.total_disposal_received_qty === 0}
              readOnly
              checked={materials?.some(
                (item: any) => item.material.id === original?.material?.id
              )}
            />
          </div>
        )
      },
    },
  ]

  const [search, setSearch] = useState('')

  const stock = useInfiniteQuery({
    queryKey: [
      'infinite-scroll-list',
      'self-disposal-list-stock',
      { activity, entity, disposal_method, search },
    ],
    queryFn: ({ pageParam }) =>
      listStock({
        page: pageParam,
        keyword: search,
        paginate: 100,
        activity_id: activity?.value,
        entity_id: entity?.value,
        flow_id: disposal_method?.value,
        material_level_id: KfaLevelEnum.KFA_93,
        only_have_qty: 1,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page + 1,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    staleTime: 0,
    enabled: Boolean(
      entity?.value && activity?.value && disposal_method?.value
    ),
  })

  const data = stock.data?.pages.map((page) => page.data).flat()
  return (
    <div className="ui-w-full">
      <InfiniteScrollList
        id="list-material-self-disposal-create"
        title={t('create.title_material_select', {
          entity_name: entity?.label ?? '',
        })}
        description={t('create.caption_choose_material')}
        data={data}
        hasNextPage={stock.hasNextPage}
        fetchNextPage={stock.fetchNextPage}
        onClickRow={(row: Stock) => {
          if (activity === null) {
            return
          }

          if ((row.total_disposal_discard_qty + row.total_disposal_received_qty) === 0) {
            return
          }
          const index = materials?.findIndex(
            (item) => item.material.id === row.material.id
          )

          const isChecked = index !== -1

          if (isChecked) {
            setOpenConfirmationChange(index as number)
            return
          }

          append({
            material: {
              id: row.material.id,
              name: row.material.name,
              is_managed_batch: !!row.material.is_managed_in_batch,
            },
            activity: {
              id: activity.value || 0,
              name: activity.label || '',
            },
            activities: row.material.activities,
            selected_activities: activity.value ? [activity.value] : [],
            disposal_qty: row.total_disposal_discard_qty + row.total_disposal_received_qty,
            items: row.details
              .flatMap((detailItem) =>
                detailItem.stocks.map(y => ({
                  id: detailItem.material_id,
                  activity: {
                    id: activity.value || 0,
                    name: activity.label || '',
                  },
                  batch: y.batch ? {
                    id: y.batch.id,
                    code: y.batch.code,
                    production_date: y.batch.production_date,
                    expired_date: y.batch.expired_date,
                    manufacture: {
                      id: y.batch.manufacture.id,
                      name: y.batch.manufacture.name,
                    },
                  } : null,
                  disposal_discard_qty: y.disposal_discard_qty,
                  disposal_received_qty: y.disposal_received_qty,
                  disposals: y.disposals.map(disposal => ({
                    id: disposal.disposal_stock_id,
                    piece_per_unit: row.material.consumption_unit_per_distribution_unit,
                    max_disposal_discard_qty: disposal.disposal_discard_qty,
                    max_disposal_received_qty: disposal.disposal_received_qty,
                    disposal_discard_qty: null,
                    disposal_received_qty: null,
                    transaction_reason: {
                      id: disposal.transaction_reason.id,
                      title: disposal.transaction_reason.title,
                    },
                  })),
                }))
              ),
            other_items: [],
          })
        }}
        handleSearch={(keyword) => {
          setSearch(keyword)
        }}
        columns={tableSchema}
        isLoading={stock.isFetching}
        config={{
          searchBar: {
            show: true,
            placeholder: t('create.material_table.material_name'),
          },
          totalItems: {
            show: true,
          },
        }}
        totalItems={data?.length}
      />
    </div>
  )
}

export default SelfDisposalCreateListStock
