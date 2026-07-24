import AssetManagementsDeviceRelation from '#pages/asset-managements/components/AssetManagementsDeviceRelationTable'

import { RELATION_TYPE } from '../../../../asset-managements.constants'
import { useMonitoringDeviceInventoryDetail } from '../../MonitoringDeviceInventoryDetailContext'

export const RelationTable = () => {
  const { data, setAssetType } = useMonitoringDeviceInventoryDetail()

  return (
    <AssetManagementsDeviceRelation
      type={RELATION_TYPE.OPS}
      detailId={data?.id ?? 0}
      detailData={data}
      setAssetType={setAssetType}
      noUtcDate={true}
    />
  )
}
