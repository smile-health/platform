import { useQuery } from '@tanstack/react-query'

import { RELATION_TYPE } from '../asset-managements.constants'
import { listRelationDevice, TRelationType } from '../asset-managements.service'

export const useLoggerRelation = ({
  id,
  type,
}: {
  id: number
  type: TRelationType
}) => {
  const {
    data: loggerData,
    isLoading: isLoadingLogger,
    refetch,
  } = useQuery({
    queryKey: [
      'device-relation-list',
      `${type === RELATION_TYPE.TEMPERATURE_MONITORING_DEVICE ? 'asset-inventory-detail' : 'asset-monitoring-device-detail'}-${id}`,
    ],
    queryFn: () => listRelationDevice({ id, type }),
    enabled: !!id && type !== RELATION_TYPE.STORAGE_TEMPERATURE_MONITORING,
  })

  return {
    loggerData,
    isLoadingLogger,
    refetch,
  }
}
