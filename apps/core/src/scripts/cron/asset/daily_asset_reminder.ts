import { AssetInventoryService } from "@/modules/asset-inventory/utils/asset-inventory.service"

export const dailyAssetMaintenanceReminder = async () => {
  const assetService = new AssetInventoryService()
  await assetService.sendMaintenanceReminder()
  process.exit(0)
}

export const dailyAssetCalibrationReminder = async () => {
  const assetService = new AssetInventoryService()
  await assetService.sendCalibrationReminder()
  process.exit(0)
}

export const dailyAssetWarrantyReminder = async () => {
  const assetService = new AssetInventoryService()
  await assetService.sendWarrantyReminder()
  process.exit(0)
}

export const dailyUnlinkedRtmdReminder = async () => {
  const assetService = new AssetInventoryService()
  await assetService.sendUnlinkedRtmdReminder()
  process.exit(0)
}

export const dailyAssetDefrostingReminder = async () => {
  const assetService = new AssetInventoryService()
  await assetService.sendDefrostingReminder()
  process.exit(0)
}
