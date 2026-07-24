export default class Region {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public regionType:
        | 'COUNTRY'
        | 'PROVINCE/STATE'
        | 'CITY'
        | 'DISTRICT'
        | 'SUB-DISTRICT'
        | 'VILLAGE';
    public parentId: number | undefined;
    public code: string;
    public name: string;

    constructor(regional: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        regionType: 'COUNTRY' | 'PROVINCE/STATE' | 'CITY' | 'DISTRICT' | 'SUB-DISTRICT' | 'VILLAGE';
        parentId?: number;
        code: string;
        name: string;
    }) {
        this.id = regional.id;
        this.createdAt = regional.createdAt;
        this.createdBy = regional.createdBy;
        this.updatedAt = regional.updatedAt;
        this.updatedBy = regional.updatedBy;
        this.regionType = regional.regionType;
        this.parentId = regional.parentId;
        this.code = regional.code;
        this.name = regional.name;
    }
}
