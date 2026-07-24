import EntitySettings from '../entities/EntitySettings';

export default interface EntitySettingsRepository {
    checkDuplication(entityId: number, settingName: string, settingValue: string): Promise<boolean>;
    createEntitySettings(payload: EntitySettings): Promise<void>;
    getEntitySettingsById(id: number): Promise<EntitySettings | null>;
    getAllEntitySettingss(
        limit: number,
        page: number,
        search: string | undefined,
        entityId: string | undefined,
    ): Promise<{
        data: EntitySettings[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    updateEntitySettings(payload: EntitySettings): Promise<void | null>;
    deleteEntitySettings(id: string, deletedBy?: number): Promise<boolean | null>;
}
