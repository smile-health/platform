import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';
import EntityLocationDTO from '../../dtos/EntityLocationDTO';
import EntityLocation from '../../../domain/entities/EntityLocation';

export default class UpdateEntityLocationUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(token:string, data: EntityLocationDTO): Promise<EntityLocation | string> {
        try {
            const {
                id,
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
                updatedBy,
            } = data;

            if (!id) {
                return 'ID is required to update an entity setting';
            }

            const existingData = await this.repo.getEntityLocationById(id, token);

            if (!existingData) {
                return `Entity setting with ID ${id} not found`;
            }

            const entitySetting = new EntityLocation({
                id: id,
                entityId: entityId ?? existingData?.entityId,
                locationName: locationName ?? existingData?.locationName,
                latitude: latitude ?? existingData?.latitude,
                longitude: longitude ?? existingData?.longitude,
                distanceLimitInMeters: distanceLimitInMeters ?? existingData?.distanceLimitInMeters,
                address: address ?? existingData?.address,
                provinceId: provinceId ?? existingData?.provinceId,
                cityId: cityId ?? existingData?.cityId,
                provinceName: provinceName ?? existingData?.provinceName,
                cityName: cityName ?? existingData?.cityName,
                createdBy: updatedBy,
                createdAt: existingData?.createdAt ?? new Date(),
                updatedBy: updatedBy,
                updatedAt: new Date(),
            });

            await this.repo.updateEntityLocation(entitySetting);
            console.log('Entity location created successfully:', entitySetting);
            return entitySetting;
        } catch (error) {
            console.error('Error creating Entity Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
