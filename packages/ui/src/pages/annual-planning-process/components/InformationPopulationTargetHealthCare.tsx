import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "#components/data-table"
import { useInformationPopulationTarget } from "../hooks/useInformationPopulationTarget"
import { setColumnInformationPopulationAdjustment, transformDataCentral } from "../annual-planning-process.utils"
import { useDataGroupTarget } from "../store/group-target.store"

type Props = {
  allDataPopulations: Record<string, number>
}

const InformationPopulationTargetHealthCare: React.FC<Props> = ({ allDataPopulations }) => {
  const { t, i18n: { language } } = useTranslation('annualPlanningProcess')
  const { central_population } = useInformationPopulationTarget()
  const { group_target } = useDataGroupTarget()

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    return setColumnInformationPopulationAdjustment(group_target, language)
  }, [group_target, language])

  const data = [
    {
      name: 'Pusdatin',
      ...transformDataCentral(central_population.population_data, group_target)[0]
    },
    {
      name: t('create.form.adjustment'),
      ...allDataPopulations
    }
  ]

  if (columns.length === 0) return null

  return (
    <DataTable
      columns={columns}
      data={data}
      withBorder
    />
  )
}

export default InformationPopulationTargetHealthCare