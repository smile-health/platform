import EntitySettingsRepository from '../../../domain/repositories/EntitySettingsRepository';
import EntitySettingsDTO from '../../dtos/EntitySettingsDTO';
import EntitySettings from '../../../domain/entities/EntitySettings';

export default class CreateEntitySettingUseCase {
    constructor(private readonly repo: EntitySettingsRepository) {}

    async execute(data: EntitySettingsDTO): Promise<EntitySettings | string> {
        try {
            const { entityId, settingName, settingValue, createdBy } = data;

            const existingData = await this.repo.checkDuplication(
                entityId,
                settingName,
                settingValue,
            );

            if (!existingData) {
                return `Entity setting with name ${settingName} already exists for entity ID ${entityId}`;
            }

            const entitySetting = new EntitySettings({
                entityId,
                settingName,
                settingValue,
                createdBy,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
            });

            await this.repo.createEntitySettings(entitySetting);
            console.log('Entity setting created successfully:', entitySetting);
            return entitySetting;
        } catch (error) {
            console.error('Error creating Entity Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
