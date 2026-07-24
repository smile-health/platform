import Region from '../../../domain/entities/Region';
import { RegionModel } from '../models/RegionModel';
import RegionRepository from '../../../domain/repositories/RegionRepository';
import { checkExistingData, checkExistingOneData } from '../../../shared/utils/checkExistingData';

export default class RegionRepositoryImpl implements RegionRepository {
    async getValidationDistanceLimit(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
        type: string,
        entityId: number,
    ): Promise<boolean> {
        try {
            return true;
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }
    async getRegionById(id: string): Promise<Region | null> {
        try {
            const existingData = (await checkExistingData(RegionModel, id)) as any;

            if (!existingData) {
                console.error(`Waste source with ID ${id} not found`);
                return null;
            }

            return new Region({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.get('created_by'),
                updatedBy: existingData.get('updated_by'),
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                regionType: existingData.get('region_type'),
                parentId: existingData.get('parent_id'),
                code: existingData.get('code'),
                name: existingData.get('name'),
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }

    async getOneRegion(): Promise<Region | null> {
        try {
            const existingData = (await checkExistingOneData(RegionModel)) as any;

            if (!existingData) {
                console.error(`region not found`);
                return null;
            }

            return new Region({
                id: existingData.get('id') as number | undefined,
                createdBy: existingData.get('created_by'),
                updatedBy: existingData.get('updated_by'),
                createdAt: existingData.get('created_at'),
                updatedAt: existingData.get('updated_at') as Date,
                regionType: existingData.get('region_type'),
                parentId: existingData.get('parent_id'),
                code: existingData.get('code'),
                name: existingData.get('name'),
            });
        } catch (error) {
            console.error('Error retrieving waste source:', error);
            throw new Error('Error retrieving waste source');
        }
    }
}
