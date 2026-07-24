import Entities from '../../../domain/entities/Entities';

export interface SpeedRegionRef {
    id: number | null;
    nama: string | null;
}

export interface SpeedEntityTypeRef {
    id: number | null;
    nama: string | null;
}

export interface SpeedEntityResponse {
    id: number;
    nib: string | null;
    nama: string;
    alamat: string | null;
    provinsi: SpeedRegionRef;
    kabupaten_kota: SpeedRegionRef;
    kecamatan: SpeedRegionRef;
    jenis_entitas: SpeedEntityTypeRef;
    kategori: string | null;
    lintang: number | null;
    bujur: number | null;
    id_satu_sehat: number | null;
}

export function mapEntityToSpeedResponse(entity: Entities): SpeedEntityResponse {
    return {
        id: entity.id as number,
        nib: entity.nib ?? null,
        nama: entity.name as string,
        alamat: entity.address ?? null,
        provinsi: {
            id: entity.province_id ? Number(entity.province_id) : null,
            nama: entity.province_name ?? null,
        },
        kabupaten_kota: {
            id: entity.regency_id ? Number(entity.regency_id) : null,
            nama: entity.regency_name ?? null,
        },
        // id dari kolom sub_district_id, nama dari kolom district_name (dua nama kolom berbeda
        // di data sumber untuk konsep yang sama)
        kecamatan: {
            id: entity.sub_district_id ? Number(entity.sub_district_id) : null,
            nama: entity.district_name ?? null,
        },
        jenis_entitas: {
            id: entity.entity_type_id ?? null,
            nama: entity.entity_type_name ?? null,
        },
        // tidak ada id numerik untuk kategori/tag di manapun di sistem — dikirim sebagai string biasa
        kategori: entity.tag ?? null,
        lintang: entity.latitude ?? null,
        bujur: entity.longitude ?? null,
        id_satu_sehat: entity.id_satu_sehat ?? null,
    };
}
