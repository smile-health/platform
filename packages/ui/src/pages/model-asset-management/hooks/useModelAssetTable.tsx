import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { SingleValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { parseDateTime } from '#utils/date'
import { getFullName } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import { ordinalWords } from '../asset-model.constants'
import {
  CapacityData,
  DetailModelAssetResponse,
  ModelAssetTableProps,
} from '../asset-model.type'

const useModelAssetTable = ({ page, size }: ModelAssetTableProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['modelAsset', 'common'])
  const { getAsLinkGlobal } = useSmileRouter()

  const handleAction = (type: 'edit' | 'detail', id: string | number) => {
    const isEdit = type === 'edit'

    let url = `/v5/global-settings/asset/model/${id}`
    if (isEdit) {
      url += '/edit'
    }

    let options
    if (isEdit) {
      options = { fromPage: 'list' }
    }

    return getAsLinkGlobal(url, null, options)
  }

  const renderCapacityData = (
    data: CapacityData[],
    type: 'gross_capacity' | 'net_capacity'
  ) => {
    const isPQSEquipment = data.every(
      (item) => Object.hasOwn(item, 'category') && item.category !== null
    )

    const rows = isPQSEquipment
      ? [...data].sort((a, b) => (b.category ?? 0) - (a.category ?? 0))
      : data

    const capacities = rows.map((item, index) => {
      const displayCategory = item.category === 5 ? '+5' : item.category
      const indexDisplay = index + 1

      const firstValue =
        language === 'en' && !isPQSEquipment
          ? ordinalWords?.[indexDisplay as keyof typeof ordinalWords]
          : null

      let secondValue
      if (isPQSEquipment) {
        secondValue = `${displayCategory} °C`
      } else if (language === 'id') {
        secondValue = ` - ${indexDisplay}`
      } else {
        secondValue = displayCategory
      }

      return {
        label: t('list.column.capacity', {
          ['1st_value']: firstValue,
          ['2nd_value']: secondValue,
        }),
        value: item[type],
      }
    })

    const noCapacities = capacities?.every((item) => item.value === null)

    return noCapacities
      ? '-'
      : capacities?.map((data) => (
          <div key={data.label} className="ui-flex ui-gap-1">
            <SingleValue valueClassName="ui-font-semibold" {...data} />
          </div>
        ))
  }

  const schema: Array<ColumnDef<DetailModelAssetResponse>> = [
    {
      header: 'No.',
      accessorKey: 'no',
      size: 40,
      minSize: 40,
      cell: ({ row: { index } }) => (page - 1) * size + (index + 1),
    },
    {
      header: t('list.column.name'),
      accessorKey: 'name',
      minSize: 380,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="ui-flex ui-flex-col">
          <p className="ui-font-semibold ui-text-sm">{row?.original?.name}</p>
          <p className="ui-text-sm">
            {t('list.column.type', {
              type: row?.original?.asset_type_name,
            })}
          </p>
          <p className="ui-text-sm ui-text-[#737373]">
            {t('list.column.manufacturer', {
              manufacturer: row?.original?.manufacture_name,
            })}
          </p>
        </div>
      ),
    },
    {
      header: t('list.column.asset_gross_capacity'),
      accessorKey: 'gross_capacity',
      minSize: 220,
      cell: ({ row }) =>
        renderCapacityData(row?.original?.capacities, 'gross_capacity'),
    },
    {
      header: t('list.column.asset_netto_capacity'),
      accessorKey: 'net_capacity',
      minSize: 220,
      cell: ({ row }) =>
        renderCapacityData(row?.original?.capacities, 'net_capacity'),
    },
    {
      header: t('list.column.update_by'),
      accessorKey: 'updated_at',
      size: 220,
      minSize: 220,
      enableSorting: true,
      cell: ({ row }) => (
        <div className="ui-flex ui-flex-col">
          <p className="ui-uppercase ui-font-semibold">
            {parseDateTime(row.original.updated_at || '', 'DD MMM YYYY HH:mm')}
          </p>
          <p>
            {getFullName(
              row?.original?.user_updated_by?.firstname,
              row?.original?.user_updated_by?.lastname
            )}
          </p>
        </div>
      ),
    },
    {
      header: t('list.column.action'),
      accessorKey: 'action',
      size: 123,
      minSize: 123,
      cell: ({ row }) => {
        return (
          <div className="ui-flex ui-gap-2 -ml-3">
            <Button
              asChild
              id={`btn-link-model-asset-detail-${row.original.id}`}
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('detail', row.original.id)}>Detail</Link>
            </Button>
            <Button
              asChild
              id={`btn-link-model-asset-edit-${row.original.id}`}
              size="sm"
              variant="subtle"
            >
              <Link href={handleAction('edit', row.original.id)}>
                {t('common:edit')}
              </Link>
            </Button>
          </div>
        )
      },
    },
  ]

  return {
    schema,
  }
}

export default useModelAssetTable
