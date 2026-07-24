import { Fragment, useMemo } from "react"
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
import cx from "#lib/cx"
import { parseDateTime } from "#utils/date"
import { useTranslation } from "react-i18next"
import { numberFormatter } from "#utils/formatter"
import { roundIfNeeded, toSnakeCase } from "../../annual-planning-process.utils"
import { columnsChildPopulationCorrectionPreview } from "#pages/annual-planning-process/annual-planning-process.table-form-population"
import { GetDetailAnnualPlanningProcessPopulationTarget } from "../../annual-planning-process.types"

type Props = {
  columns: Record<any, any>[]
  data: GetDetailAnnualPlanningProcessPopulationTarget[]
}
const AnnualPlanningProcessPopulationContent: React.FC<Props> = (props) => {
  const { columns, data } = props
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])

  const memoizedColumnsChildPopulationCorrectionPreview = useMemo(
    () => columnsChildPopulationCorrectionPreview(t), [t]
  )

  return (
    <div className="ui-space-y-6 ui-mt-3">
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
        <Thead className="ui-bg-slate-100">
          <Tr>
            <Th
              id="header-no"
              columnKey="header-no"
              key="header-no"
              rowSpan={2}
              className="ui-w-[50px]"
            >
              No
            </Th>
            <Th
              id="header-name"
              columnKey="header-name"
              key="header-name"
              rowSpan={2}
              className="ui-min-w-48"
            >
              {t('annualPlanningProcess:create.form.calculation_result.column.health_care_name')}
            </Th>
            {columns.map(x => (
              <Th
                id={x.key}
                columnKey={x.key}
                key={x.key}
                colSpan={3}
                className="ui-max-w-64 ui-font-semibold ui-text-center"
              >
                {x.header}
              </Th>
            ))}
            <Th
              id="header-updated-by"
              columnKey="header-updated-by"
              key="header-updated-by"
              rowSpan={2}
              className="ui-min-w-36 ui-text-center"
            >
              {t('annualPlanningProcess:create.form.calculation_result.column.updated_by')}
            </Th>
          </Tr>
          <Tr>
            {columns.map((targetGroup, i) => (
              <Fragment key={`${targetGroup.key}-${i}`}>
                {memoizedColumnsChildPopulationCorrectionPreview.map((inputColumn, j) => (
                  <Th
                    id={inputColumn.key}
                    columnKey={inputColumn.key}
                    key={inputColumn.key}
                    className={cx("ui-w-10 ui-font-semibold ui-border-r ui-text-center", targetGroup.className)}
                  >
                    {inputColumn.header}
                  </Th>
                ))}
              </Fragment>
            ))}
          </Tr>
        </Thead>
        <Tbody className="ui-bg-white ui-max-h-[620px]">
          {data.map((healthCare, i) => (
            <Tr
              key={healthCare.id}
              className="ui-text-sm ui-font-normal"
            >
              <Td className="ui-content-start">{i + 1}</Td>
              <Td className="ui-content-start">{healthCare.entity.name}</Td>

              {columns.map((targetGroup, idx) => {
                const population = healthCare.annual_need_populations?.find(hcTargetGroup => toSnakeCase(hcTargetGroup.target_group_name) === targetGroup.key)

                return (
                  <Fragment key={`${targetGroup.key}-${idx}`}>
                    <Td className="ui-content-start ui-text-center">{roundIfNeeded(population?.percentage || 0)}%</Td>
                    <Td className="ui-content-start ui-text-center">{numberFormatter(population?.population, language)}</Td>
                    <Td className="ui-content-start ui-text-center">{numberFormatter(population?.population_correction, language)}</Td>
                  </Fragment>
                )
              })}

              <Td className="ui-content-start ui-flex ui-flex-col ui-gap">
                <span>{healthCare.user_updated_by?.name || '-'}</span>
                <span>{parseDateTime(healthCare.updated_at || '', 'DD/MM/YYYY HH:mm', language).toUpperCase()}</span>
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
    </div>
  )
}

export default AnnualPlanningProcessPopulationContent