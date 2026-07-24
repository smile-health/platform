export default interface EntitySettingsDTO {
    id?: number;
    createdBy: string;
    updatedBy: string;
    settingName: string;
    settingValue: string;
    createdAt?: Date;
    updatedAt?: Date;
}
