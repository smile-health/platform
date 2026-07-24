import GlobalSettingsRepository from '../../../domain/repositories/GlobalSettingsRepository';
import GlobalSettingsDTO from '../../dtos/GlobalSettingsDTO';
import GlobalSettings from '../../../domain/entities/GlobalSettings';

export default class UpdateGlobalSettingsUseCase {
    constructor(private readonly repo: GlobalSettingsRepository) {}

    async execute(data: GlobalSettingsDTO): Promise<GlobalSettings | string> {
        try {
            const { id, settingName, settingValue, updatedBy } = data;

            if (!id) {
                return 'ID is required to update an entity setting';
            }

            const existingData = await this.repo.getGlobalSettingsById(id);

            if (!existingData) {
                return `Global setting with ID ${id} not found`;
            }

            const entitySetting = new GlobalSettings({
                id: id,
                settingName: settingName ?? existingData?.settingName,
                settingValue: settingValue ?? existingData?.settingValue,
                createdBy: updatedBy,
                createdAt: existingData?.createdAt ?? new Date(),
                updatedBy: updatedBy,
                updatedAt: new Date(),
            });

            await this.repo.updateGlobalSettings(entitySetting);
            console.log('Global setting created successfully:', entitySetting);
            return entitySetting;
        } catch (error) {
            console.error('Error creating Global Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
