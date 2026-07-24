export default interface EntitySettingsDTO {
    id?: number;
    createdBy: string;
    updatedBy: string;
    entityId: number;
    settingName: string;
    settingValue: string;
    createdAt?: Date;
    updatedAt?: Date;
}
