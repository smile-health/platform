export default class GlobalSettings {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public settingName: string;
    public settingValue: string;

    constructor(data: {
        id?: number;
        createdBy: string;
        updatedBy: string;
        createdAt: Date;
        updatedAt: Date;
        settingName: string;
        settingValue: string;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedAt = data.updatedAt;
        this.updatedBy = data.updatedBy;
        this.settingName = data.settingName;
        this.settingValue = data.settingValue;
    }
}
