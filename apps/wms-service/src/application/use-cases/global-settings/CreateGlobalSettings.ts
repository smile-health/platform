import GlobalSettingsRepository from '../../../domain/repositories/GlobalSettingsRepository';
import GlobalSettingsDTO from '../../dtos/GlobalSettingsDTO';
import GlobalSettings from '../../../domain/entities/GlobalSettings';

export default class CreateGlobalSettingsUseCase {
    constructor(private readonly repo: GlobalSettingsRepository) {}

    async execute(data: GlobalSettingsDTO): Promise<GlobalSettings | string> {
        try {
            const { settingName, settingValue, createdBy } = data;

            const entitySetting = new GlobalSettings({
                settingName,
                settingValue,
                createdBy,
                createdAt: new Date(),
                updatedBy: createdBy,
                updatedAt: new Date(),
            });

            await this.repo.createGlobalSettings(entitySetting);
            console.log('Entity setting created successfully:', entitySetting);
            return entitySetting;
        } catch (error) {
            console.error('Error creating Entity Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
