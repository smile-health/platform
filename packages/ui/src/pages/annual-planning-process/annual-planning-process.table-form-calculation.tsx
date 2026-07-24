import { Button } from "#components/button"
import { ColumnDef } from "@tanstack/react-table"
import {
  DataCalculationResult,
  GetDataDetailMonthlyCalculationResultResponse,
} from "./annual-planning-process.types"
import { TFunction } from "i18next"
import { parseDateTime } from "#utils/date"
import { numberFormatter } from "#utils/formatter"

type ColumnsCalculationResult = {
  t: TFunction<['annualPlanningProcess', 'common']>
  language: string
  onClickRow: (data: DataCalculationResult) => void
}
export const columnsCalculationResult = ({
  t,
  language,
  onClickRow,
}: ColumnsCalculationResult): ColumnDef<DataCalculationResult>[] => [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1,
      size: 50,
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.health_care_name'),
      accessorKey: 'name',
      minSize: 250,
      cell: ({ row: { original: { entity, sub_district } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {entity?.name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
            {sub_district?.name ?? '-'}
          </p>
        </div>
      )
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.one_year'),
      accessorKey: 'year',
      cell: ({ row: { original: { yearly_need } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {`${numberFormatter(yearly_need.vial, language)} (vial)`}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {`${numberFormatter(yearly_need.dosis, language)} ${t('annualPlanningProcess:create.form.calculation_result.dose')}`}
          </p>
        </div>
      )
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.one_month'),
      accessorKey: 'month',
      cell: ({ row: { original: { monthly_need } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {`${numberFormatter(monthly_need.vial, language)} (vial)`}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {`${numberFormatter(monthly_need.dosis, language)} ${t('annualPlanningProcess:create.form.calculation_result.dose')}`}
          </p>
        </div>
      )
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.one_week'),
      accessorKey: 'week',
      cell: ({ row: { original: { weekly_need } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {`${numberFormatter(weekly_need.vial, language)} (vial)`}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
            {`${numberFormatter(weekly_need.dosis, language)} ${t('annualPlanningProcess:create.form.calculation_result.dose')}`}
          </p>
        </div>
      )
    },
    {
      header: 'Min',
      accessorKey: 'min',
      cell: (info) => numberFormatter(info.getValue() as number, language),
    },
    {
      header: 'Max',
      accessorKey: 'max',
      cell: (info) => numberFormatter(info.getValue() as number, language),
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.monthly_distribution'),
      accessorKey: 'month_distribution',
      cell: ({ row: { original } }) => {
        const { monthly_need } = original

        return (
          <div className="ui-flex ui-flex-col ui-gap-2 ui-justify-center">
            <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
              {t('annualPlanningProcess:create.form.calculation_result.dose_distribution', {
                dose: numberFormatter(monthly_need.dosis, language)
              })}
            </p>
            <Button
              type="button"
              onClick={() => onClickRow(original)}
              variant="subtle"
              size="sm"
              className="ui-w-max ui-p-0"
            >
              {t('common:detail')}
            </Button>
          </div>
        )
      }
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.latest_updated_by'),
      accessorKey: 'updated',
      cell: ({ row: { original: { updated_at, user_updated_by } } }) => (
        <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
            {user_updated_by?.name ?? '-'}
          </p>
          <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
            {updated_at ? parseDateTime(updated_at, 'DD MMM YYYY HH:mm', language).toUpperCase() : '-'}
          </p>
        </div>
      )
    },
  ]

type ColumnsCalculationResultDetail = {
  t: TFunction<['annualPlanningProcess', 'common']>
  language: string
}
export const columnsCalculationResultDetail = ({
  t,
  language,
}: ColumnsCalculationResultDetail): ColumnDef<GetDataDetailMonthlyCalculationResultResponse['monthly_distributions']>[] => [
    {
      header: 'No',
      accessorKey: 'no',
      cell: ({ row: { index } }) => index + 1,
      size: 50,
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.month'),
      accessorKey: 'month',
    },
    {
      header: t('annualPlanningProcess:create.form.calculation_result.column.quantity'),
      accessorKey: 'quantity',
      cell: (info) => info.getValue() ? numberFormatter(info.getValue() as number, language) : '-',
    },
  ]