import { TFunction } from "i18next"
import { ProcessStatus } from "../annual-planning-process.constants"
import { Color } from "#types/component"
import { Badge } from "#components/badge"

type Props = {
  status?: number | null
  t: TFunction<'annualPlanningProcess'>
}
const ColumnStatusMaterial: React.FC<Props> = (props) => {
  const { status, t } = props
  let temp: { color: Color, text: string } = {
    color: 'neutral',
    text: ''
  }

  switch (status) {
    case ProcessStatus.APPROVED:
      temp = { color: 'success', text: t('list.status.approved') }
      break;
    case ProcessStatus.REJECT:
      temp = { color: 'warning', text: t('list.status.revision') }
      break;

    default:
      break;
  }

  if (!temp.text) return '-'

  return (
    <Badge
      id={`txt-status-${temp.text?.toLowerCase()}`}
      className="ui-text-nowrap ui-text-sm ui-font-medium"
      color={temp.color}
      size="md"
      rounded="full"
      variant="light"
    >
      {temp.text}
    </Badge>
  )
}

export default ColumnStatusMaterial
