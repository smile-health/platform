import HealthcareAsset from '../entities/HealthcareAsset';

export default interface HealthcareAssetRepository {
  createHealthcareAsset(data: HealthcareAsset): Promise<void>;
  getHealthcareAssetById(id: number, token: string, entityId: number, lang?: string): Promise<any>;
  updateHealthcareAsset(data: HealthcareAsset, token: string): Promise<void | null>;
  getActiveHealthcareWasteScaleAssets(entityId: number, token: string): Promise<any>;
}
