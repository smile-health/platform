import SpeedWaste, {
    SpeedLocation,
    SpeedWasteClassification,
    SpeedWasteLogHistoryEntry,
} from '../../../domain/entities/SpeedWaste';

export interface SpeedWasteLokasi {
    id_provinsi: number | null;
    nama_provinsi: string | null;
    id_kabupaten_kota: number | null;
    nama_kabupaten_kota: string | null;
    id_kecamatan: number | null;
    nama_kecamatan: string | null;
}

export interface SpeedKlasifikasiLimbah {
    id: number;
    id_jenis_limbah: number;
    nama_jenis_limbah: string | null;
    id_kelompok_limbah: number;
    nama_kelompok_limbah: string | null;
    id_karakteristik_limbah: number;
    nama_karakteristik_limbah: string | null;
    kode_limbah: string;
    kode_warna_kantong: string;
    gunakan_penyimpanan_dingin: boolean;
}

export interface SpeedRiwayatLogEntry {
    status: string;
    aksi: string;
    tanggal: Date;
}

export interface SpeedWasteResponse {
    id: number;
    kode_kantong_limbah: string;
    id_entitas: number;
    nama_entitas: string | null;
    nib?: string | null;
    lokasi: SpeedWasteLokasi;
    klasifikasi_limbah: SpeedKlasifikasiLimbah | null;
    id_pengangkut: number | null;
    nama_pengangkut: string | null;
    id_pihak_ketiga: number | null;
    nama_pihak_ketiga: string | null;
    nomor_kendaraan: string | null;
    dimiliki_oleh: string;
    berat_kg: number | null;
    berat_ton: number | null;
    status_limbah: string;
    status_limbah_diperbarui_pada: Date | null;
    status_limbah_diperbarui_oleh: string | null;
    status_pengangkutan: string | null;
    status_pengangkutan_diperbarui_pada: Date | null;
    status_pengangkutan_diperbarui_oleh: string | null;
    dibuat_pada: Date;
    dibuat_oleh: string;
    diperbarui_pada: Date | null;
    diperbarui_oleh: string | null;
    waktu_mulai_penyimpanan: Date | null;
    waktu_akhir_penyimpanan_aktual: Date | null;
    sudah_diolah: boolean;
    sudah_dibuang: boolean;
    nomor_bin: string | null;
    metode_iot: string | null;
    nomor_dokumen_manifest: string | null;
    tautan_dokumen_manifest: string | null;
    waktu_mulai_pengolahan: Date | null;
    waktu_akhir_pengolahan: Date | null;
    id_lokasi_pengolahan: number | null;
    nomor_bast: string | null;
    riwayat_log?: SpeedRiwayatLogEntry[];
}

function toLokasi(location: SpeedLocation): SpeedWasteLokasi {
    return {
        id_provinsi: location.provinceId,
        nama_provinsi: location.provinceName,
        id_kabupaten_kota: location.regencyId,
        nama_kabupaten_kota: location.regencyName,
        id_kecamatan: location.districtId,
        nama_kecamatan: location.districtName,
    };
}

export function toKlasifikasiLimbah(classification: SpeedWasteClassification | null): SpeedKlasifikasiLimbah | null {
    if (!classification) return null;
    return {
        id: classification.id,
        id_jenis_limbah: classification.wasteTypeId,
        nama_jenis_limbah: classification.wasteTypeName,
        id_kelompok_limbah: classification.wasteGroupId,
        nama_kelompok_limbah: classification.wasteGroupName,
        id_karakteristik_limbah: classification.wasteCharacteristicId,
        nama_karakteristik_limbah: classification.wasteCharacteristicName,
        kode_limbah: classification.wasteCode,
        kode_warna_kantong: classification.wasteBagColorCode,
        gunakan_penyimpanan_dingin: classification.useColdStorage,
    };
}

export function toRiwayatLog(entries: SpeedWasteLogHistoryEntry[]): SpeedRiwayatLogEntry[] {
    return entries.map((entry) => ({
        status: entry.status,
        aksi: entry.action,
        tanggal: entry.date,
    }));
}

export function mapWasteToSpeedResponse(waste: SpeedWaste, includeLogHistory: boolean): SpeedWasteResponse {
    const response: SpeedWasteResponse = {
        id: waste.id,
        kode_kantong_limbah: waste.wasteBagCode,
        id_entitas: waste.entityId,
        nama_entitas: waste.entityName,
        lokasi: toLokasi(waste.location),
        klasifikasi_limbah: toKlasifikasiLimbah(waste.wasteClassification),
        id_pengangkut: waste.transporterId,
        nama_pengangkut: waste.transporterName,
        id_pihak_ketiga: waste.thirdPartyId,
        nama_pihak_ketiga: waste.thirdPartyName,
        nomor_kendaraan: waste.vehicleNumber,
        dimiliki_oleh: waste.ownedBy,
        berat_kg: waste.weightInKgs,
        berat_ton: waste.weightInTons,
        status_limbah: waste.wasteStatus,
        status_limbah_diperbarui_pada: waste.wasteStatusUpdatedAt,
        status_limbah_diperbarui_oleh: waste.wasteStatusUpdatedBy,
        status_pengangkutan: waste.transportationStatus,
        status_pengangkutan_diperbarui_pada: waste.transportationStatusUpdatedAt,
        status_pengangkutan_diperbarui_oleh: waste.transportationStatusUpdatedBy,
        dibuat_pada: waste.createdAt,
        dibuat_oleh: waste.createdBy,
        diperbarui_pada: waste.updatedAt,
        diperbarui_oleh: waste.updatedBy,
        waktu_mulai_penyimpanan: waste.storageStartTimestamp,
        waktu_akhir_penyimpanan_aktual: waste.actualStorageEndDatetime,
        sudah_diolah: waste.isTreated,
        sudah_dibuang: waste.isDisposed,
        nomor_bin: waste.binNumber,
        metode_iot: waste.iotMethod,
        nomor_dokumen_manifest: waste.manifestDocNumber,
        tautan_dokumen_manifest: waste.manifestDocPath,
        waktu_mulai_pengolahan: waste.treatmentStartTime,
        waktu_akhir_pengolahan: waste.treatmentEndTime,
        id_lokasi_pengolahan: waste.treatmentLocationId,
        nomor_bast: waste.bastNo,
    };

    if (includeLogHistory) {
        response.riwayat_log = toRiwayatLog(waste.logHistory ?? []);
    }

    // Detail-only, same as riwayat_log — `entityNib` is only ever set by getWasteById, so this
    // key simply doesn't appear on list rows rather than showing a misleading `null`.
    if (waste.entityNib !== undefined) {
        response.nib = waste.entityNib;
    }

    return response;
}
