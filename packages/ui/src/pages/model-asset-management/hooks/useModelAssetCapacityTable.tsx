import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '#components/data-table'
import { SingleValue } from '#components/modules/RenderDetailValue'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { ordinalWords } from '../asset-model.constants'
import { CapacityDataPQS, DetailModelAssetResponse } from '../asset-model.type'

const useModelAssetCapacityTable = (data?: DetailModelAssetResponse) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['modelAsset', 'common'])

  const renderCapacityData = (
    data?: DetailModelAssetResponse,
    type?: 'capacity' | 'capacity_pqs'
  ) => {
    const isCapacityTable = type === 'capacity_pqs'

    const capacities = data?.[
      isCapacityTable ? 'net_capacities_who' : 'capacities'
    ]?.map((item, index) => {
      const isPQSEquipment = Boolean((item as CapacityDataPQS).category)
      const firstValue =
        language === 'en' && !isPQSEquipment
          ? ordinalWords?.[(index + 1) as keyof typeof ordinalWords]
          : null

      const handleIdLanguage = (index: number) => {
        return language === 'id' ? ` - ${index + 1}` : null
      }

      const secondValue = isPQSEquipment
        ? `${(item as CapacityDataPQS).category} °C`
        : handleIdLanguage(index)

      return {
        label: isPQSEquipment
          ? `${(item as CapacityDataPQS).category} °C`
          : t('list.column.capacity', {
              ['1st_value']: firstValue,
              ['2nd_value']: secondValue,
            }),
        value: item,
      }
    })
    return capacities
  }

  const getSchema = (type?: 'capacity' | 'capacity_pqs'): ColumnDef<any>[] => [
    {
      header: t('form.detail.capacity.column.category'),
      accessorKey: 'category',
      size: 300,
      cell: ({ row }: any) => row.original.label,
    },
    ...(type === 'capacity_pqs'
      ? []
      : [
          {
            header: t('form.detail.capacity.column.gross_capacity'),
            accessorKey: 'gross_capacity',
            size: 350,
            cell: ({ row }: any) => {
              return `${numberFormatter(row.original.value.gross_capacity, language)} ${t('common:litre')}`
            },
          },
        ]),
    {
      header: t('form.detail.capacity.column.net_capacity'),
      accessorKey: 'net_capacity',
      size: 350,
      cell: ({ row }: any) => {
        return `${numberFormatter(row.original.value.net_capacity, language)} ${t('common:litre')}`
      },
    },
  ]

  const generateCapacityTable = (type?: 'capacity' | 'capacity_pqs') => {
    const capacityData = [
      {
        header: t('form.detail.capacity.header'),
        type: 'capacity' as const,
        data: renderCapacityData(data, 'capacity'),
      },
      {
        header: t('form.detail.capacity.header_pqs'),
        type: 'capacity_pqs' as const,
        data: renderCapacityData(data, 'capacity_pqs'),
      },
    ]
    return capacityData
      .filter((item) => item.type === type)
      .map((item) => (
        <div
          className="ui-flex ui-flex-col ui-justify-between ui-items-start ui-gap-4"
          key={item.header}
        >
          <hr className="ui-border ui-border-neutral-100 ui-my-2 ui-w-full" />
          <h5 className="ui-font-bold">{item.header}</h5>
          {item.type === 'capacity_pqs' && (
            <div className="ui-flex ui-flex-row ui-gap-2">
              <SingleValue
                label={t('form.detail.label.pqs_code')}
                value={data?.pqs_code ?? '-'}
              />
            </div>
          )}
          <div className="ui-grid ui-grid-cols-2">
            <DataTable columns={getSchema(item.type)} data={item.data} />
          </div>
        </div>
      ))
  }

  return {
    generateCapacityTable,
  }
}

export default useModelAssetCapacityTable
