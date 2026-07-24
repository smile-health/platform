import { useTranslation } from "react-i18next"
import { GetDetailAnnualPlanningProcessDistrictIPResponse } from "../../annual-planning-process.types"
import { DataTable } from "#components/data-table"
import { columnsDetailMaterialList } from "#pages/annual-planning-process/annual-planning-process.table-form-district-ip"

type Props = {
  data: GetDetailAnnualPlanningProcessDistrictIPResponse['data']
}
const AnnualPlanningProcessMaterialIPContent: React.FC<Props> = ({ data }) => {
  const { t, i18n: { language } } = useTranslation('annualPlanningProcess')

  return (
    <div className="ui-space-y-6 ui-mt-3">
      <DataTable
        columns={columnsDetailMaterialList({ t, language })}
        data={data}
      />
    </div>
  )
}

export default AnnualPlanningProcessMaterialIPContent