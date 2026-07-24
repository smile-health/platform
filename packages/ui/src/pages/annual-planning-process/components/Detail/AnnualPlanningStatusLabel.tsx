import { Badge } from '#components/badge'
import { useTranslation } from 'react-i18next'
import { TDetailAnnualPlanningProcess } from '../../annual-planning-process.types'
import { statusMap } from '../../annual-planning-process.constants'

type Props = {
  status?: TDetailAnnualPlanningProcess['status']
}

const AnnualPlanningStatusLabel = ({ status }: Props) => {
  const { t } = useTranslation(['annualPlanningProcess'])
  
  if(!status) return null
  return (
      <Badge
        rounded="full"
        color={statusMap[status].color}
        variant="outline"
        className="ui-py-2"
      >
        {t(statusMap[status].label)}
      </Badge>
  )
}

export default AnnualPlanningStatusLabel
