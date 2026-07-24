import { Badge } from '#components/badge'
import { useTranslation } from 'react-i18next'

enum LabelType {
  ACTIVE_INACTIVE = '1',
  SUCCESS_FAILED = '2',
}

type Props = {
  isActive?: boolean

  /**
   * 1 is for active and inactive.
   * 2 is for success and failed
   */
  type?: '1' | '2'
}

export default function ActiveLabel({ isActive, type = '1' }: Readonly<Props>) {
  const { t } = useTranslation()
  const statusMap = {
    [LabelType.ACTIVE_INACTIVE]: isActive
      ? t('status.active')
      : t('status.inactive'),
    [LabelType.SUCCESS_FAILED]: isActive
      ? t('status.success')
      : t('status.failed'),
  }

  const textValue = statusMap[type] || ''

  return (
    <Badge
      id={`txt-status-${textValue?.toLowerCase()}`}
      className="ui-text-nowrap"
      color={isActive ? 'success' : 'danger'}
      size="md"
      rounded="full"
      variant="light"
    >
      {textValue}
    </Badge>
  )
}
