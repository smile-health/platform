import { ColumnDef } from '@tanstack/react-table'
import { numberFormatter } from '#utils/formatter'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import { getVaccineCategoryLabel } from '../dashboard-rabies.constant'
import { TDashboardRabiesEntity } from '../dashboard-rabies.type'
import DashbaordRabiesTitleBlock from './DashboardRabiesTitleBlock'

type Params = {
  t: TFunction<'dashboardRabies'>
  language: string
}

export const MainColumn = ({ t, language }: Params) => {
  const schema: Array<ColumnDef<TDashboardRabiesEntity>> = [
    {
      header: 'No.',
      accessorKey: 'row',
      size: 20,
      maxSize: 20,
    },
    {
      header: t('label.location'),
      accessorKey: 'regency_name',
      cell: ({
        row: {
          original: { regency_name, province_name },
        },
      }) => (
        <DashbaordRabiesTitleBlock
          arrText={[
            {
              firstLabel: regency_name,
              firstClassName: 'ui-font-bold ui-mb-1',
            },
            {
              firstLabel: province_name,
              firstClassName: 'ui-font-normal',
            },
          ]}
        />
      ),
    },
    {
      header: t('label.entity_name'),
      accessorKey: 'entity_name',
    },
    {
      header: t('label.patient_id'),
      accessorKey: 'patient_nik',
    },
    {
      header: t('label.material_info'),
      accessorKey: 'material_name',
      size: 350,
      maxSize: 350,
      cell: ({
        row: {
          original: { material_category, material_name },
        },
      }) => (
        <DashbaordRabiesTitleBlock
          arrText={[
            {
              firstLabel: `${material_category ? getVaccineCategoryLabel(t, material_category?.toLowerCase()) : '-'}`,
              firstClassName: 'ui-font-bold ui-mb-1',
            },
            {
              firstLabel: material_name,
              firstClassName:
                'ui-font-normal ui-break-words ui-whitespace-normal',
            },
          ]}
        />
      ),
    },
    {
      header: t('label.injection_info'),
      accessorKey: 'vaccine_type',
      cell: ({
        row: {
          original: { vaccine_type, injection },
        },
      }) => (
        <DashbaordRabiesTitleBlock
          arrText={[
            {
              firstLabel: vaccine_type,
              firstClassName: 'ui-font-bold ui-mb-1',
            },
            {
              firstLabel: `${t('label.quantity')} ${numberFormatter(injection ?? 0, language)}`,
              firstClassName: 'ui-font-normal',
            },
          ]}
        />
      ),
    },
    {
      header: t('label.created_at'),
      accessorKey: 'actual_transaction_date',
      cell: ({ getValue }) => {
        const value = getValue<string>()
        return value ? dayjs(value).format('DD MMM YYYY')?.toUpperCase() : '-'
      },
    },
  ]

  return schema
}
