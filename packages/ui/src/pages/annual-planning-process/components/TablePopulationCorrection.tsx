import { Fragment, useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFormContext } from "react-hook-form"
import { XMarkIcon } from "@heroicons/react/24/solid"
import {
  Table,
  TableEmpty,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from "#components/table"
import { Switch } from "#components/switch"
import CheckV2 from "#components/icons/CheckV2"
import { EmptyState } from "#components/empty-state"
import cx from "#lib/cx"
import { FormPopulationCorrectionDataForm } from "../annual-planning-process.types"
import {
  columnsChildPopulationCorrectionPreview
} from "../annual-planning-process.table-form-population"
import { numberFormatter } from "#utils/formatter"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import { useInformationPopulationTarget } from "../hooks/useInformationPopulationTarget"
import { mergeTotalsPopulationCorrection, roundIfNeeded, toKeyValueMap, toSnakeCase } from "../annual-planning-process.utils"
import { parseDateTime } from "#utils/date"
import { useDataGroupTarget } from "../store/group-target.store"
import { ProcessStatus } from "../annual-planning-process.constants"

type CellGroupProps = {
  percentage: number | string
  qty: number
  changeQty: number
  status?: number | null
  onCheckedChange?: (checked: boolean) => void
}
const CellGroup: React.FC<CellGroupProps> = (props) => {
  const { t, i18n: { language } } = useTranslation('annualPlanningProcess')
  const {
    isReview,
    isRevision,
  } = useContext(AnnualPlanningProcessCreateContext)
  const shouldShowStatus = props.status !== undefined && isReview
  const shouldShowRevision = isRevision && typeof props.status === 'number' && props.status === ProcessStatus.REJECT

  return (
    <Fragment>
      <Td className="ui-content-start ui-text-center">{props.percentage}%</Td>
      <Td className="ui-content-start ui-text-center">{numberFormatter(props.qty, language)}</Td>
      <Td
        className={cx("ui-content-start ui-text-center", {
          'ui-bg-[#FEF2F2]': shouldShowRevision
        })}
      >
        <span className={cx({ "ui-flex ui-flex-col ui-gap-1 ui-items-center": shouldShowStatus || shouldShowRevision })}>
          {numberFormatter(props.changeQty, language)}
          {shouldShowRevision && (
            <span>
              {t('create.form.drawer_correction_data.revision')}
            </span>
          )}
          {shouldShowStatus && (
            <Switch
              checked={props.status === ProcessStatus.APPROVED}
              size="sm"
              onCheckedChange={props.onCheckedChange}
              labelInside={{
                on: <CheckV2 className="ui-text-white ui-h-4 ui-w-4" />,
                off: <XMarkIcon className="ui-text-white ui-h-4 ui-w-4" />,
              }}
              colorInside={{
                off: "data-[state=unchecked]:ui-bg-red-600",
                on: "data-[state=checked]:ui-bg-green-700"
              }}
            />
          )}
        </span>
      </Td>
    </Fragment>
  )
}

const TablePopulationCorrection: React.FC = () => {
  const {
    watch,
    setValue,
  } = useFormContext<FormPopulationCorrectionDataForm>()
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])
  const data = watch('data')

  const { central_population } = useInformationPopulationTarget()
  const { group_target } = useDataGroupTarget()

  const columns = useMemo<Record<any, any>[]>(() => {
    if (group_target && group_target.length > 0) {
      return group_target.map((x) => {
        const dataCentral = central_population?.population_data.find((y) => toSnakeCase(x.name) === toSnakeCase(y.name))

        return {
          header: x.name,
          key: toSnakeCase(x.name),
          population: dataCentral?.population_number || 0,
        }
      })
    }

    return []
  }, [group_target, central_population])

  const memoizedColumnsChildPopulationCorrectionPreview = useMemo(
    () => columnsChildPopulationCorrectionPreview(t), [t]
  )

  const dataHealthCare = useMemo(() => mergeTotalsPopulationCorrection(data), [data])
  const populationDataCentral = useMemo(() => toKeyValueMap(central_population?.population_data || []), [central_population])
  const populationDataDistrict = useMemo(() => mergeTotalsPopulationCorrection(data), [data])

  const handleStatusChange = (healthCareIndex: number, targetGroupKey: string, checked: boolean) => {
    const healthCare = data[healthCareIndex]
    const indexKey = healthCare.data?.findIndex(hcTargetGroup => hcTargetGroup.key === targetGroupKey)

    if (typeof indexKey === 'number' && indexKey > -1) {
      setValue(`data.${healthCareIndex}.data.${indexKey}.status`, checked ? ProcessStatus.APPROVED : ProcessStatus.REJECT)
    }
  }

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
            className="ui-max-w-32"
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
                  className={cx("ui-w-10 ui-font-semibold ui-border-r", targetGroup.className)}
                >
                  {inputColumn.header}
                </Th>
              ))}
            </Fragment>
          ))}
        </Tr>
      </Thead>
      <Tbody className="ui-bg-white ui-max-h-[620px]">
        <Tr className="ui-text-sm ui-font-normal ui-bg-blue-50">
          <Td className="ui-content-start">1</Td>
          <Td className="ui-content-start">{central_population?.entity?.name ?? '-'}</Td>

          {columns.map((targetGroup) => (
            <CellGroup
              key={`cell-group-${targetGroup.key}`}
              percentage={100}
              qty={targetGroup.population}
              changeQty={dataHealthCare[targetGroup.key]}
            />
          ))}

          <Td className="ui-content-start ui-flex ui-flex-col ui-gap">
            <span>{central_population.user_created_by?.username}</span>
            <span>
              {parseDateTime(central_population?.updated_at || '', 'DD/MM/YYYY HH:mm', language).toUpperCase()}
            </span>
          </Td>
        </Tr>
        {data.map((healthCare, i) => (
          <Tr
            key={healthCare.id}
            className="ui-text-sm ui-font-normal"
          >
            <Td className="ui-content-start">{i + 2}</Td>
            <Td className="ui-content-start">{healthCare.name}</Td>

            {columns.map((targetGroup, idx) => {
              const value = healthCare.data?.find(hcTargetGroup => hcTargetGroup.key === targetGroup.key)

              const key = value?.key || ''
              const totalCentral = populationDataCentral[key] ? Number(populationDataCentral[key]) : 0
              const totalHealthCare = populationDataDistrict[key] ? Number(populationDataDistrict[key]) : 0

              const resultPercentage = !value?.change_qty ? 0 : value.change_qty / totalHealthCare * 100
              const resultPercentageRounded = roundIfNeeded(resultPercentage)
              const resultQty = !resultPercentage ? 0 : Math.round(totalCentral * resultPercentage / 100);

              return (
                <CellGroup
                  key={`cell-group-${i}-${idx}`}
                  percentage={resultPercentageRounded}
                  qty={resultQty}
                  changeQty={value?.change_qty ?? 0}
                  status={value?.status}
                  onCheckedChange={(checked) => handleStatusChange(i, targetGroup.key, checked)}
                />
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
  )
}

export default TablePopulationCorrection