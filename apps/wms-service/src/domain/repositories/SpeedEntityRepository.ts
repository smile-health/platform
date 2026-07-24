import Entities from '../entities/Entities';

export interface SpeedEntityListFilter {
    limit: number;
    page: number;
    search?: string;
    entityTypeId?: number;
    provinceId?: number;
    regencyId?: number;
    subDistrictId?: number;
    villageId?: number;
    idSatuSehat?: number;
    nib?: string;
}

export default interface SpeedEntityRepository {
    getAllEntities(filter: SpeedEntityListFilter): Promise<{
        data: Entities[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    getEntityByNib(nib: string): Promise<Entities | null>;
}
