import SpeedTransportGroup, {
    SpeedTransportGroupBag,
    SpeedTransportGroupPartnershipSide,
} from '../../../domain/entities/SpeedTransportGroup';
import SpeedOperator from '../../../domain/entities/SpeedOperator';
import { SpeedKlasifikasiLimbah, SpeedRiwayatLogEntry, toKlasifikasiLimbah, toRiwayatLog } from './mapWasteToSpeedResponse';

export interface SpeedOperatorResponse {
    id_operator: string;
    nama: string | null;
    id_peran: number | null;
    nama_peran: string | null;
    tipe_peran: string | null;
}

export interface SpeedMitraSisiResponse {
    id_pengangkut?: number | null;
    id_pihak_ketiga?: number | null;
    nama: string | null;
    daftar_operator: SpeedOperatorResponse[];
}

export interface SpeedMitraResponse {
    pengangkutan: SpeedMitraSisiResponse;
    pengolahan: SpeedMitraSisiResponse;
}

export interface SpeedKantongLimbahRingkasResponse {
    id: number;
    kode_kantong_limbah: string;
    status_limbah: string;
    berat_kg: number | null;
    berat_ton: number | null;
    dibuat_pada: Date;
    id_entitas: number;
    nama_entitas: string | null;
    status_limbah_diperbarui_pada: Date | null;
    riwayat_log?: SpeedRiwayatLogEntry[];
}

export interface SpeedGrupPengangkutanResponse {
    id_grup_pengangkutan: number;
    kode_grup_pengangkutan: string;
    id_entitas: number;
    nama_entitas: string | null;
    nib: string | null;
    total_kantong: number;
    total_berat_kg: number;
    total_berat_ton: number;
    status_limbah: string;
    id_pengangkut: number | null;
    nama_pengangkut: string | null;
    dibuat_pada: Date;
    daftar_kantong_limbah: SpeedKantongLimbahRingkasResponse[];
    klasifikasi_limbah: SpeedKlasifikasiLimbah | null;
    mitra: SpeedMitraResponse;
}

function toOperatorResponse(operator: SpeedOperator): SpeedOperatorResponse {
    return {
        id_operator: operator.id,
        nama: operator.name,
        id_peran: operator.roleId,
        nama_peran: operator.roleName,
        tipe_peran: operator.roleType,
    };
}

function toMitraSisi(
    side: SpeedTransportGroupPartnershipSide,
    providerKey: 'id_pengangkut' | 'id_pihak_ketiga',
): SpeedMitraSisiResponse {
    return {
        [providerKey]: side.providerId,
        nama: side.providerName,
        daftar_operator: side.operators.map(toOperatorResponse),
    } as SpeedMitraSisiResponse;
}

function toKantongLimbah(
    bag: SpeedTransportGroupBag,
    includeLogHistory: boolean,
): SpeedKantongLimbahRingkasResponse {
    const response: SpeedKantongLimbahRingkasResponse = {
        id: bag.id,
        kode_kantong_limbah: bag.wasteBagCode,
        status_limbah: bag.wasteStatus,
        berat_kg: bag.weightInKgs,
        berat_ton: bag.weightInKgs != null ? bag.weightInKgs / 1000 : null,
        dibuat_pada: bag.createdAt,
        id_entitas: bag.entityId,
        nama_entitas: bag.entityName,
        status_limbah_diperbarui_pada: bag.wasteStatusUpdatedAt,
    };
    if (includeLogHistory) {
        response.riwayat_log = toRiwayatLog(bag.logHistory ?? []);
    }
    return response;
}

export function mapTransportGroupToSpeedResponse(
    group: SpeedTransportGroup,
    includeLogHistory: boolean,
): SpeedGrupPengangkutanResponse {
    return {
        id_grup_pengangkutan: group.id,
        kode_grup_pengangkutan: group.groupCode,
        id_entitas: group.entityId,
        nama_entitas: group.entityName,
        nib: group.entityNib,
        total_kantong: group.totalBags,
        total_berat_kg: group.totalWeightInKgs,
        total_berat_ton: group.totalWeightInTons,
        status_limbah: group.wasteStatus,
        id_pengangkut: group.transporterId,
        nama_pengangkut: group.transporterName,
        dibuat_pada: group.createdAt,
        daftar_kantong_limbah: group.bags.map((bag) => toKantongLimbah(bag, includeLogHistory)),
        klasifikasi_limbah: toKlasifikasiLimbah(group.wasteClassification),
        mitra: {
            pengangkutan: toMitraSisi(group.partnership.transport, 'id_pengangkut'),
            pengolahan: toMitraSisi(group.partnership.treatment, 'id_pihak_ketiga'),
        },
    };
}
