import { useContext, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "#components/data-table"
import { FormPopulationCorrectionContext } from "../context/ContextProvider"
import { setColumnInformationPopulationAdjustment } from "../annual-planning-process.utils"
import { useDataGroupTarget } from "../store/group-target.store"

const InformationPopulationTarget: React.FC = () => {
  const { i18n: { language } } = useTranslation('annualPlanningProcess')
  const { group_target } = useDataGroupTarget()
  const {
    data: dataPopulationCorrection,
  } = useContext(FormPopulationCorrectionContext)

  const columns = useMemo<ColumnDef<any, any>[]>(() => {
    return setColumnInformationPopulationAdjustment(group_target, language)
  }, [language, group_target])

  if (columns.length === 0 || dataPopulationCorrection.length === 0) return null

  return (
    <DataTable
      columns={columns}
      data={dataPopulationCorrection}
      withBorder
    />
  )
}

export default InformationPopulationTarget