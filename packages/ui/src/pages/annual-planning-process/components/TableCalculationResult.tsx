
import { Button } from "#components/button"
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "#components/table"
import { EmptyState } from "#components/empty-state"

import { numberFormatter } from "#utils/formatter"
import { parseDateTime } from "#utils/date"
import { DataCalculationResult } from "../annual-planning-process.types"
import { useTranslation } from "react-i18next"
import { MaterialSubType } from "../annual-planning-process.constants"

type Props = {
  data: DataCalculationResult[]
  materialName: string
  activityName: string
  onClickRow: (data: DataCalculationResult) => void
  pagination: { page: number, paginate: number }
  materialSubtype: string | number
}

const TableCalculationResult: React.FC<Props> = (props) => {
  const { data, materialName, activityName, onClickRow, pagination, materialSubtype } = props
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])

  return (
    <Table
      withBorder
      rounded
      hightlightOnHover
      overflowXAuto
      stickyOffset={0}
      empty={data.length === 0}
      verticalAlignment="center"
      withColumnBorders
    >
      <Thead>
        <Tr>
          <Th className="ui-w-[50px] ui-font-semibold" rowSpan={2}>No</Th>
          <Th className="ui-min-w-60 ui-font-semibold" rowSpan={2}>
            {t('annualPlanningProcess:create.form.calculation_result.column.health_care_name')}
          </Th>
          <Th className="ui-min-w-48 ui-font-semibold ui-text-center" colSpan={5}>
            {
              !materialName && !activityName ?
                t('annualPlanningProcess:create.form.calculation_result.column.needs_empty') :
                t('annualPlanningProcess:create.form.calculation_result.column.needs', { material: materialName, activity: activityName })
            }
          </Th>
          <Th className="ui-min-w-48 ui-font-semibold" rowSpan={2}>
            {t('annualPlanningProcess:create.form.calculation_result.column.monthly_distribution')}
          </Th>
          <Th className="ui-min-w-48 ui-font-semibold" rowSpan={2}>
            {t('annualPlanningProcess:create.form.calculation_result.column.latest_updated_by')}
          </Th>
        </Tr>
        <Tr>
          <Th className="ui-w-48 ui-font-semibold ui-border-r">{t('annualPlanningProcess:create.form.calculation_result.column.one_year')}</Th>
          <Th className="ui-w-48 ui-font-semibold ui-border-r">{t('annualPlanningProcess:create.form.calculation_result.column.one_month')}</Th>
          <Th className="ui-w-48 ui-font-semibold ui-border-r">{t('annualPlanningProcess:create.form.calculation_result.column.one_week')}</Th>
          <Th className="ui-w-48 ui-font-semibold ui-border-r">Min</Th>
          <Th className="ui-w-48 ui-font-semibold ui-border-r">Max</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item, index) => (
          <Tr
            key={item.id}
            className="ui-text-sm ui-font-normal"
          >
            <Td className="ui-content-start !ui-border-r-0">{(pagination.page - 1) * pagination.paginate + (index + 1)}</Td>
            <Td className="ui-content-start !ui-border-r-0">
              <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
                <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                  {item.entity?.name ?? '-'}
                </p>
                <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
                  {item.sub_district?.name ?? '-'}
                </p>
              </div>
            </Td>
            <Td className="ui-content-start !ui-border-r-0 ui-bg-primary-50">
              {materialSubtype === MaterialSubType.VACCINE ? (
                <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
                  <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                    {`${numberFormatter(item.yearly_need.vial, language)} (vial)`}
                  </p>
                  <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                    {`${numberFormatter(item.yearly_need.dosis, language)} ${t('annualPlanningProcess:create.form.calculation_result.dose')}`}
                  </p>
                </div>
              ) : (
                <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                  {numberFormatter(item.yearly_need.dosis, language)}
                </p>
              )}
            </Td>
            <Td className="ui-content-start !ui-border-r-0">
              {materialSubtype === MaterialSubType.VACCINE ? (
                <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
                  {!item.monthly_need.vial && !item.monthly_need.dosis ? '-' : (
                    <>
                      <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                        {`${numberFormatter(item.monthly_need.vial, language)} (vial)`}
                      </p>
                      <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                        {`${numberFormatter(item.monthly_need.dosis, language)} ${t('annualPlanningProcess:create.form.calculation_result.dose')}`}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                  {numberFormatter(item.monthly_need.dosis || undefined, language)}
                </p>
              )}
            </Td>
            <Td className="ui-content-start !ui-border-r-0">
              {materialSubtype === MaterialSubType.VACCINE ? (
                <div className="ui-flex ui-flex-col ui-gap-1 ui-justify-center">
                  {!item.weekly_need.vial && !item.weekly_need.dosis ? '-' : (
                    <>
                      <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                        {`${numberFormatter(item.weekly_need.vial, language)} (vial)`}
                      </p>
                      <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                        {`${numberFormatter(item.weekly_need.dosis, language)} ${t('annualPlanningProcess:create.form.calculation_result.dose')}`}
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                  {numberFormatter(item.weekly_need.dosis || undefined, language)}
                </p>
              )}
            </Td>
            <Td className="ui-content-start !ui-border-r-0">
              {numberFormatter(item.min || undefined, language)}
            </Td>
            <Td className="ui-content-start !ui-border-r-0">
              {numberFormatter(item.max || undefined, language)}
            </Td>
            <Td className="ui-content-start !ui-border-r-0">
              <div className="ui-flex ui-flex-col ui-gap-2 ui-justify-center">
                {!!item.monthly_need.dosis && (
                  <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-primary-800">
                    {t('annualPlanningProcess:create.form.calculation_result.dose_distribution', {
                      dose: numberFormatter(item.monthly_need.dosis, language)
                    })}
                  </p>
                )}
                <Button
                  type="button"
                  onClick={() => onClickRow(item)}
                  variant="subtle"
                  size="sm"
                  className="ui-w-max ui-p-0"
                >
                  {t('common:detail')}
                </Button>
              </div>
            </Td>
            <Td className="ui-content-start ui-flex ui-flex-col ui-gap-1 ui-justify-center">
              <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-dark-blue">
                {item.user_updated_by?.name ?? '-'}
              </p>
              <p className="ui-mb-0 ui-text-sm ui-font-normal ui-text-neutral-500">
                {item.updated_at ? parseDateTime(item.updated_at, 'DD MMM YYYY HH:mm', language).toUpperCase() : '-'}
              </p>
            </Td>
          </Tr>
        ))}
      </Tbody>
      <TableEmpty>
        <EmptyState
          title={t('common:message.empty.title')}
          description={t('common:message.empty.description')}
          withIcon
        />
      </TableEmpty>
    </Table>
  )
}

export default TableCalculationResult
