import { Badge } from '#components/badge'

import { OperationalStatusEnum } from '../MonitoringDeviceInventoryList/monitoring-device-inventory-list.type'

type OperationalStatusBadgeProps = {
  statusId?: number
  statusName?: string
}

const badgeColor: Record<number, 'neutral' | 'success' | 'danger'> = {
  [OperationalStatusEnum.ACTIVE]: 'success',
  [OperationalStatusEnum.INACTIVE]: 'danger',
  [OperationalStatusEnum.UNSUBSCRIBED]: 'neutral',
}

export const OperationalStatusBadge = ({
  statusId,
  statusName,
}: OperationalStatusBadgeProps) => {
  return (
    <Badge color={badgeColor[statusId ?? 0] || 'neutral'} variant="light">
      {statusName || '-'}
    </Badge>
  )
}
