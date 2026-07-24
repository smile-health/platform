import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { TProvinceItem, TProvinceSequence } from '../dashboard-rabies.type'
import DashbaordRabiesTitleBlock from './DashboardRabiesTitleBlock'

type Params = {
  t: TFunction<['common', 'dashboardRabies']>
  language: string
  sequences: Array<string>
  onSelectProvince: (province: TProvinceItem) => void
  grandTotals: TProvinceSequence[] | undefined
  widthColumn: undefined | number
}

export const MainColumn = ({
  t,
  sequences,
  language,
  onSelectProvince,
  grandTotals,
  widthColumn,
}: Params) => {
  const sequencesSchema = sequences?.map(
    (seq: string, index: number): ColumnDef<TProvinceItem> => ({
      header: seq,
      accessorKey: seq,
      cell: ({ row: { original } }) => {
        const value = original.values[index]?.value
        return numberFormatter(value ?? 0, language)
      },
      minSize: widthColumn,
      size: widthColumn,
      footer: () => numberFormatter(Number(grandTotals?.[index]?.value ?? 0), language),
    })
  )

  const schema: Array<ColumnDef<TProvinceItem>> = [
    {
      header: 'No.',
      accessorKey: 'row',
      size: 20,
      maxSize: 20,
    },
    {
      header: t('dashboardRabies:label.province'),
      accessorKey: 'name',
      cell: ({ row: { original } }) => (
        <DashbaordRabiesTitleBlock
          arrText={[
            {
              firstLabel: original.name,
              firstClassName: 'ui-font-bold',
            },
            {
              firstLabel: `${t('dashboardRabies:label.total_patient')}: ${numberFormatter(original.total_patients ?? 0, language)}`,
            },
          ]}
        />
      ),
      minSize: 280,
      size: 280,
      footer: t('dashboardRabies:label.grand_total'),
    },
    {
      header: t('common:action'),
      accessorKey: 'id',
      cell: ({ row: { original } }) => (
        <Button
          variant="subtle"
          className="!ui-px-0"
          onClick={() => onSelectProvince(original)}
        >
          {t('common:detail')}
        </Button>
      ),
    },
  ]

  schema.splice(2, 0, ...sequencesSchema)

  return schema
}
