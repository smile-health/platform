import { ColumnDef } from "@tanstack/react-table"
import { TFunction } from "i18next"
import { AnnualCommitmentVsRealizationProvinceData } from "./dashboard-annual-commitment-vs-realization.type"
import { numberFormatter } from "#utils/formatter"

export const CHART_OPTIONS = {
  requirement_and_remaining: {},
  national: {},
  target: {
    layout: {
      padding: {
        top: 50,    // Space for milestone labels above
        bottom: 30, // Space for values below
        left: 10,
        right: 10
      }
    },
    scales: {
      x: {
        ticks: {
          callback: function () {
            return ''
          },
          maxTicksLimit: 0
        },
      }
    }
  },
  province: {
    plugins: {
      datalabels: {
        formatter: () => ''
      }
    },
    scales: {
      y: {
        ticks: {
          crossAlign: 'far' as const,
        },
      }
    }
  }
}

export const createDownloadConfig = (t: TFunction<'dashboardAnnualCommitmentVsRealization'>) => ({
  requirement_and_remaining: {
    targetElementId: 'dashboard-annual-commitment-vs-realization-requirement-and-remaining',
    fileName: `Dashboard Annual Commitment Vs Realization - ${t('box_title.annual_requirements_and_remaining_stock')}`,
  },
  national: {
    targetElementId: 'dashboard-annual-commitment-vs-realization-national',
    fileName: `Dashboard Annual Commitment Vs Realization - ${t('box_title.annual_commitment_vs_realization_national')}`,
  },
  target: {
    targetElementId: 'dashboard-annual-commitment-vs-realization-target',
    fileName: `Dashboard Annual Commitment Vs Realization - ${t('box_title.realization_and_target')}`,
  },
  province: {
    targetElementId: 'dashboard-annual-commitment-vs-realization-province',
    fileName: `Dashboard Annual Commitment Vs Realization - ${t('box_title.annual_commitment_vs_realization_province')}`,
  }
})

type CreateColumnsProps = {
  t: TFunction<'dashboardAnnualCommitmentVsRealization'>
  language: string
}
export const createColumns = ({ t, language }: CreateColumnsProps): ColumnDef<AnnualCommitmentVsRealizationProvinceData>[] => [
  {
    header: 'No',
    accessorKey: 'no',
    cell: ({ row: { index } }) => index + 1
  },
  {
    header: t('columns.province'),
    accessorKey: 'province.name',
    cell: (info) => info.getValue()
  },
  {
    header: t('columns.total_needs'),
    accessorKey: 'total_yearly_need',
    cell: (info) => numberFormatter(info.getValue() as number, language)
  },
  {
    header: t('columns.total_commitment'),
    accessorKey: 'total_commitment_reguler_dose',
    cell: (info) => numberFormatter(info.getValue() as number, language)
  },
  {
    header: t('columns.central_buffer_receipt'),
    accessorKey: 'total_used_buffer_dose',
    cell: (info) => numberFormatter(info.getValue() as number, language)
  },
  {
    header: t('columns.allocation_shipped'),
    accessorKey: 'total_used_reguler_dose',
    cell: (info) => numberFormatter(info.getValue() as number, language)
  },
  {
    header: t('columns.allocation_not_shipped_yet'),
    accessorKey: 'total_unused_reguler_dose',
    cell: (info) => numberFormatter(info.getValue() as number, language)
  },
]
