import SpeedWaste from '../entities/SpeedWaste';

export interface SpeedWasteListFilter {
    limit: number;
    page: number;
    id?: number;
    entityId?: number;
    // Resolved to entityId internally (join on EntitiesModel.nib) — takes precedence over
    // entityId if both are sent, since they identify the same thing two different ways.
    nib?: string;
    transporterId?: number;
    thirdPartyId?: number;
    wasteClassificationId?: number[];
    ownedBy?: string;
    wasteStatus?: string;
    wasteBagCode?: string;
    wasteTypeId?: number[];
    wasteGroupId?: number[];
    wasteCharacteristicsId?: number[];
}

export interface SpeedWasteAggregateRincian {
    id_kelompok_limbah: number;
    nama_kelompok_limbah: string | null;
    total_transaksi: number;
    total_berat: number;
}

export interface SpeedWasteAggregateTransaksi {
    id_jenis_limbah: number;
    nama_jenis_limbah: string | null;
    total_transaksi: number;
    total_berat: number;
    rincian: SpeedWasteAggregateRincian[];
}

export interface SpeedWasteAggregate {
    total_berat: number;
    total_transaksi: number;
    transaksi: SpeedWasteAggregateTransaksi[];
}

export default interface SpeedWasteRepository {
    getAllWaste(filter: SpeedWasteListFilter): Promise<{
        data: SpeedWaste[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    getWasteById(wasteBagCode: string): Promise<SpeedWaste | null>;
    getAggregate(
        startDate?: string,
        endDate?: string,
        entityId?: number,
        nib?: string,
    ): Promise<SpeedWasteAggregate>;
}
