import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { UniqueConstraintError } from 'sequelize';
import HealthcareAssetRepository from '../../../domain/repositories/HealthcareAssetRepository';
import HealthcareAsset from '../../../domain/entities/HealthcareAsset';
import HealthcareAssetModel, { HealthcareAssetAttributes } from '../models/HealthcareAssetModel';
import { getAssetInventories, getAssetInventoriesById } from '../../external-apis/thirdPartyClient';

export default class HealthcareAssetImpl implements HealthcareAssetRepository {
  async createHealthcareAsset(data: HealthcareAsset): Promise<void> {
    try {
      if (
        !data.createdAt ||
        !data.updatedAt ||
        !data.assetTypeName ||
        !data.assetWorkingStatusName ||
        !data.healthcareFacilityId ||
        !data.id
      ) {
        throw new Error('Missing required fields for HealthcareFacilityAsset');
      }

      const createModelObj: HealthcareAssetAttributes = {
        id: data.id,
        assetId: data.assetId,
        assetTypeName: data.assetTypeName,
        healthcareFacilityId: data.healthcareFacilityId,
        assetWorkingStatusName: data.assetWorkingStatusName,
        status: true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      console.log('createModelObj:', createModelObj);
      await HealthcareAssetModel.create(createModelObj);
      console.log('HealthcareFacilityAsset created successfully');
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Healthcare facility asset creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Healthcare facility asset: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Healthcare facility asset');
      }
    }
  }

  async getHealthcareAssetById(
    id: number,
    token: string,
    entityId: number,
    lang?: string,
  ): Promise<any> {
    try {
      const existingDataById: any = await HealthcareAssetModel.findOne({
        where: {
          id: id,
        },
      });
      const existingData: any = await HealthcareAssetModel.findOne({
        where: {
          id: id,
          healthcareFacilityId: entityId,
        },
      });

      let assetInventories = await getAssetInventoriesById(id, token, lang);

      if (!existingData && assetInventories) {
        if (entityId === assetInventories.entity?.id && !existingDataById) {
          const newAsset = new HealthcareAsset({
            id: assetInventories.id,
            assetTypeName: assetInventories.asset_type?.name,
            healthcareFacilityId: assetInventories.entity?.id,
            assetWorkingStatusName: assetInventories.working_status?.id,
            status: true,
            createdAt: assetInventories.created_at ?? new Date(),
            updatedAt: assetInventories.updated_at ?? new Date(),
          });
          await this.createHealthcareAsset(newAsset);
        } else {
          const updateAsset = new HealthcareAsset({
            id: assetInventories.id,
            assetTypeName: assetInventories.asset_type?.name,
            healthcareFacilityId: assetInventories.entity?.id,
            assetWorkingStatusName: assetInventories.working_status?.id,
            status: assetInventories.status.id,
            createdAt: assetInventories.created_at ?? new Date(),
            updatedAt: assetInventories.updated_at ?? new Date(),
          });
          await HealthcareAssetModel.update(updateAsset, {
            where: { id: assetInventories.id },
          });
        }
      } else if (!assetInventories) {
        console.error(`existing Data healthcare asset with ID ${id} not found`);
        return null;
      }

      return {
        assetId:
          assetInventories?.asset_id ?? existingData?.assetId ?? existingDataById?.assetId ?? null,
        ...assetInventories,
      };
    } catch (error) {
      console.error('Error retrieving HealthcareAsset:', error);
      throw new Error('Error retrieving HealthcareAsset');
    }
  }

  async updateHealthcareAsset(data: HealthcareAsset, token: string): Promise<void | null> {
    try {
      const existingData = (await checkExistingData(HealthcareAssetModel, data.id)) as any;

      if (!existingData) {
        let assetInventories = await getAssetInventoriesById(data.id, token);
        const newAsset = new HealthcareAsset({
          id: assetInventories.id,
          assetId: data.assetId ? data.assetId : null,
          assetTypeName: assetInventories.asset_type?.name,
          healthcareFacilityId: assetInventories.entity?.id,
          assetWorkingStatusName: assetInventories.working_status?.id,
          status: true,
          createdAt: assetInventories.created_at ?? new Date(),
          updatedAt: assetInventories.updated_at ?? new Date(),
        });
        await this.createHealthcareAsset(newAsset);
      }

      const updateModelObj = {
        id: data.id,
        assetId: data.assetId ? data.assetId : null,
        assetTypeName: data.assetTypeName,
        healthcareFacilityId: data.healthcareFacilityId,
        assetWorkingStatusName: data.assetWorkingStatusName,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      await HealthcareAssetModel.update(updateModelObj, {
        where: { id: data.id },
      });
      console.log('HealthcareAsset updated successfully');
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        const message = error.errors.map((err) => err.message).join(', ');
        throw new Error(`Vehicle creation failed: ${message}`);
      } else if (error instanceof Error) {
        throw new Error(`Error creating Healthcare facility asset: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while creating Healthcare facility asset');
      }
    }
  }

  async getActiveHealthcareWasteScaleAssets(entityId: number, token: string): Promise<any[]> {
    const [assetInventories, healthcareScaleAssets] = await Promise.all([
      getAssetInventories(
        {
          page: 1,
          paginate: 100,
          asset_type_ids: '40',
          health_center_id: entityId,
          status: '1',
          working_status_id: '1',
        },
        token,
      ),
      HealthcareAssetModel.findAll({
        attributes: ['id', 'assetId'],
        where: {
          healthcareFacilityId: entityId,
          assetTypeName: 'Waste Scale',
          status: 1,
          assetWorkingStatusName: 1,
        },
        raw: true,
      }),
    ]);

    const hcsAssetMap = new Map<number, string>();
    healthcareScaleAssets.forEach((asset: any) => {
      hcsAssetMap.set(asset.id, asset.assetId);
    });

    return assetInventories?.data?.map((asset: any) => {
      return {
        id: asset.id,
        assetId: hcsAssetMap.get(asset.id) || null,
      };
    });
  }
}
