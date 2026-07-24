import { SingleValue } from '#components/modules/RenderDetailValue'
import { useTranslation } from 'react-i18next'

import { GetDetailAnnualPlanningProcessResponse } from '../../annual-planning-process.types'
import AnnualPlanningStatusLabel from '../Detail/AnnualPlanningStatusLabel'
import { generateAnnualPlanningDetail } from '../../annual-planning-process.utils'

type Props = {
  data?: GetDetailAnnualPlanningProcessResponse
}

const AnnualPlanningProcessDetailInformationContent = (
  props: Props
) => {
  const { data } = props
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const details = generateAnnualPlanningDetail(t, data)

  return (
    <div className="ui-p-4 ui-mt-3 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('common:details')}</h5>
      <AnnualPlanningStatusLabel status={data?.status} />
      <div className="ui-grid ui-grid-cols-[264px_3px_1fr] ui-gap-x-2 ui-gap-y-4">
        {details?.map(({ label, value, id }) => (
          <SingleValue id={id} key={id} label={label} value={value} />
        ))}
      </div>
    </div>
  )
}

export default AnnualPlanningProcessDetailInformationContent
