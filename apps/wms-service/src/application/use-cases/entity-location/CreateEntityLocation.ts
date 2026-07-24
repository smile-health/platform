import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';
import EntityLocationDTO from '../../dtos/EntityLocationDTO';
import EntityLocation from '../../../domain/entities/EntityLocation';

export default class CreateEntityLocationUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(data: EntityLocationDTO): Promise<EntityLocation | string> {
        try {
            const {
                entityId,
                locationName,
                latitude,
                longitude,
                distanceLimitInMeters,
                address,
                provinceId,
                cityId,
                createdBy,
                provinceName,
                cityName,
                entityTag,
                locationType,
            } = data;

            if (!entityTag) return 'ENTITY_TAG_MISSING';

            const entitySetting = new EntityLocation({
                entityId,
                locationName,
                latitude,
                longitude,
                distanceLimitInMeters,
                address,
                provinceId,
                cityId,
                provinceName,
                cityName,
                createdBy,
                locationType,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
            });

            if (entityTag.includes('hospital')) {
                const result = await this.repo.createEntityLocationHF(entitySetting);
                console.log('Entity location created successfully:', entitySetting);
                if (typeof result === 'string') return result
                return entitySetting;
            } else {
                await this.repo.createEntityLocationTP(entitySetting);
                console.log('Entity location created successfully:', entitySetting);
                return entitySetting;
            }
        } catch (error) {
            console.error('Error creating Entity Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
