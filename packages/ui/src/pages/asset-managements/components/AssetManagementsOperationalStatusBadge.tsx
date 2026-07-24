import { Badge } from '#components/badge'
import { useTranslation } from 'react-i18next'

import { useAssetInventoryForm } from '../../asset-inventory/form/hooks/useAssetInventoryForm'
import { WORKING_STATUS_ENUM } from '../asset-managements.constants'
import { TDefaultObject } from '../asset-managements.types'

export type AssetManagementsOperationalStatusBadgeProps = {
  working_status?: TDefaultObject
}

export const AssetManagementsOperationalStatusBadge = ({
  working_status,
}: AssetManagementsOperationalStatusBadgeProps) => {
  const {
    i18n: { language },
  } = useTranslation(['common'])
  const { workingStatus } = useAssetInventoryForm({ data: null })

  const status = workingStatus?.[working_status?.id as WORKING_STATUS_ENUM]
  const variant = status?.color

  return (
    <Badge key={language} variant="light" rounded="xl" color={variant}>
      {working_status?.name}
    </Badge>
  )
}
