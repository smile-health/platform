import EntitySettingsRepository from '../../../domain/repositories/EntitySettingsRepository';
import EntitySettingsDTO from '../../dtos/EntitySettingsDTO';
import EntitySettings from '../../../domain/entities/EntitySettings';

export default class UpdateEntitySettingsUseCase {
    constructor(private readonly repo: EntitySettingsRepository) {}

    async execute(data: EntitySettingsDTO): Promise<EntitySettings | string> {
        try {
            const { id, entityId, settingName, settingValue, updatedBy } = data;

            if (!id) {
                return 'ID is required to update an entity setting';
            }

            const existingData = await this.repo.getEntitySettingsById(id);

            if (!existingData) {
                return `Entity setting with ID ${id} not found`;
            }

            const entitySetting = new EntitySettings({
                id: id,
                entityId: entityId ?? existingData?.entityId,
                settingName: settingName ?? existingData?.settingName,
                settingValue: settingValue ?? existingData?.settingValue,
                createdBy: updatedBy,
                createdAt: existingData?.createdAt ?? new Date(),
                updatedBy: updatedBy,
                updatedAt: new Date(),
            });

            await this.repo.updateEntitySettings(entitySetting);
            console.log('Entity setting created successfully:', entitySetting);
            return entitySetting;
        } catch (error) {
            console.error('Error creating Entity Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
