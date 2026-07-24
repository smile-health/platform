import SpeedHandoverRepository from '../../../domain/repositories/SpeedHandoverRepository';
import { GetAllSpeedTreatmentProvidersDTO } from '../../dtos/GetAllSpeedTreatmentProvidersDTO';

export interface SpeedTreatmentLocationResponse {
    id_lokasi_pengolahan: number;
    nama: string;
    alamat: string | null;
}

export interface SpeedTreatmentProviderResponse {
    id_pihak_ketiga: number;
    nama: string;
    nib: string | null;
    lokasi: SpeedTreatmentLocationResponse[];
}

export default class GetAllSpeedTreatmentProviders {
    constructor(private readonly repo: SpeedHandoverRepository) {}

    async execute(data: GetAllSpeedTreatmentProvidersDTO): Promise<{
        data: SpeedTreatmentProviderResponse[];
        pagination: { total: number; pages: number; currentPage: number; perPage: number };
    }> {
        try {
            const result = await this.repo.getAllTreatmentProviders({
                limit: data.limit ?? 10,
                page: data.page ?? 1,
                keyword: data.keyword,
                nib: data.nib,
            });

            return {
                data: result.data.map((provider) => ({
                    id_pihak_ketiga: provider.id,
                    nama: provider.name,
                    nib: provider.nib,
                    lokasi: provider.locations.map((location) => ({
                        id_lokasi_pengolahan: location.id,
                        nama: location.name,
                        alamat: location.address,
                    })),
                })),
                pagination: result.pagination,
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
