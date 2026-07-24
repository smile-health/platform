import { Badge } from "#components/badge"
import { getStatusConfig } from "../annual-planning-process.utils"
import { useTranslation } from "react-i18next"

type Props = {
  statusId: number
}

const ColumnStatusAnnualPlanning: React.FC<Props> = ({ statusId }) => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const { color, text } = getStatusConfig(statusId, t)

  return (
    <Badge
      id={`txt-status-${text.toLowerCase()}`}
      className="ui-text-nowrap ui-text-sm ui-font-medium"
      color={color}
      size="md"
      rounded="full"
      variant="light"
    >
      {text}
    </Badge>
  )
}

export default ColumnStatusAnnualPlanning

