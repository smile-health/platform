export default class GlobalSettings {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy?: string;
    public name: string;
    public type: string;
    public description: string;
    public regionId?: number;

    constructor(data: {
        id?: number;
        createdBy: string;
        updatedBy: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        description: string;
        regionId: number;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedAt = data.updatedAt;
        this.updatedBy = data.updatedBy;
        this.name = data.name;
        this.type = data.type;
        this.description = data.description;
        this.regionId = data.regionId;
    }
}
