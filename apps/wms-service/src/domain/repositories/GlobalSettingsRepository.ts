import GlobalSettings from '../entities/GlobalSettings';

export default interface GlobalSettingsRepository {
    checkDuplication(settingName: string, settingValue: string): Promise<boolean>;
    createGlobalSettings(payload: GlobalSettings): Promise<void>;
    getGlobalSettingsById(id: number): Promise<GlobalSettings | null>;
    getAllGlobalSettingss(
        limit: number,
        page: number,
        search: string | undefined,
    ): Promise<{
        data: GlobalSettings[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    updateGlobalSettings(payload: GlobalSettings): Promise<void | null>;
    deleteGlobalSettings(id: string, deletedBy?: number): Promise<boolean | null>;
}
