import { Request, Response } from 'express';
import SpeedHandoverRepositoryImpl from '../../../infrastructure/database/repositories/SpeedHandoverRepositoryImpl';
import GetAllSpeedTransportGroups from '../../../application/use-cases/speed/GetAllSpeedTransportGroups';
import GetSpeedTransportGroupByCode from '../../../application/use-cases/speed/GetSpeedTransportGroupByCode';
import GetAllSpeedOperators from '../../../application/use-cases/speed/GetAllSpeedOperators';
import GetAllSpeedTreatmentProviders from '../../../application/use-cases/speed/GetAllSpeedTreatmentProviders';
import HandoverSpeedTransportWaste from '../../../application/use-cases/speed/HandoverSpeedTransportWaste';
import HandoverSpeedTreatmentWaste from '../../../application/use-cases/speed/HandoverSpeedTreatmentWaste';

// SPEED responses are always Indonesian regardless of the partner's Accept-Language header.
const SPEED_LOCALE = { lng: 'id' };

// Same helper as speedWasteController.ts — invalid numeric input becomes `undefined` (filter
// ignored) instead of `NaN`, and still allows a legitimate `0`.
function parseOptionalInt(value: unknown): number | undefined {
    if (value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
}

// Accepts a repeated multipart/form-data field (array) or a single JSON array/bare value.
function parseStringList(value: unknown): string[] {
    if (value === undefined || value === null || value === '') return [];
    if (Array.isArray(value)) return value.map(String);
    return [String(value)];
}

function parseBooleanField(value: unknown): boolean | undefined {
    if (value === undefined) return undefined;
    return String(value) === 'true';
}

export async function getAllSpeedTransportGroups(req: Request, res: Response): Promise<void> {
    try {
        const { halaman, batas, id_entitas, nib, status_limbah, tanggal_mulai, tanggal_akhir } = req.query;

        const repo = new SpeedHandoverRepositoryImpl();
        const useCase = new GetAllSpeedTransportGroups(repo);

        const result = await useCase.execute({
            page: halaman ? Number(halaman) : undefined,
            limit: batas ? Number(batas) : undefined,
            entityId: parseOptionalInt(id_entitas),
            nib: nib ? String(nib) : undefined,
            wasteStatus: status_limbah ? String(status_limbah) : undefined,
            startDate: tanggal_mulai ? String(tanggal_mulai) : undefined,
            endDate: tanggal_akhir ? String(tanggal_akhir) : undefined,
        });

        const paginasi = {
            total: result.pagination.total,
            jumlah_halaman: result.pagination.pages,
            halaman_saat_ini: result.pagination.currentPage,
            per_halaman: result.pagination.perPage,
        };

        res.success(result.data, { pagination: paginasi, paginationKey: 'paginasi' });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error', SPEED_LOCALE));
        }
    }
}

export async function getSpeedTransportGroupByCode(req: Request, res: Response): Promise<void> {
    try {
        const { kode_grup_pengangkutan } = req.params;

        const repo = new SpeedHandoverRepositoryImpl();
        const useCase = new GetSpeedTransportGroupByCode(repo);

        const data = await useCase.execute({ groupCode: kode_grup_pengangkutan });

        if (!data) {
            res.fail(`Grup pengangkutan dengan kode ${kode_grup_pengangkutan} tidak ditemukan`, {
                isNotFoundError: true,
            });
            return;
        }

        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error', SPEED_LOCALE));
        }
    }
}

export async function getAllSpeedOperators(req: Request, res: Response): Promise<void> {
    try {
        const { id_entitas, nib, peran } = req.query;

        const entityId = parseOptionalInt(id_entitas);
        const nibValue = nib ? String(nib) : undefined;
        if (!entityId && !nibValue) {
            res.fail('Salah satu dari id_entitas atau nib wajib diisi', { isValidationError: true });
            return;
        }

        const repo = new SpeedHandoverRepositoryImpl();
        const useCase = new GetAllSpeedOperators(repo);

        const data = await useCase.execute({
            entityId,
            nib: nibValue,
            role: peran ? String(peran) : undefined,
        });

        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error', SPEED_LOCALE));
        }
    }
}

export async function getAllSpeedTreatmentProviders(req: Request, res: Response): Promise<void> {
    try {
        const { halaman, batas, kata_kunci, nib } = req.query;

        const repo = new SpeedHandoverRepositoryImpl();
        const useCase = new GetAllSpeedTreatmentProviders(repo);

        const result = await useCase.execute({
            page: halaman ? Number(halaman) : undefined,
            limit: batas ? Number(batas) : undefined,
            keyword: kata_kunci ? String(kata_kunci) : undefined,
            nib: nib ? String(nib) : undefined,
        });

        const paginasi = {
            total: result.pagination.total,
            jumlah_halaman: result.pagination.pages,
            halaman_saat_ini: result.pagination.currentPage,
            per_halaman: result.pagination.perPage,
        };

        res.success(result.data, { pagination: paginasi, paginationKey: 'paginasi' });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error', SPEED_LOCALE));
        }
    }
}

const TRANSPORT_ERROR_MESSAGES: Record<string, string> = {
    INVALID_GROUP_IDS: 'Kode grup pengangkutan tidak valid',
    NOT_FOUND: 'Data tidak ditemukan',
    VEHICLE_NOT_FOUND: 'Kendaraan tidak ditemukan',
    NO_WASTE_BAGS_UPDATED: 'Tidak ada kantong limbah yang berhasil diperbarui',
};

export async function handoverSpeedTransport(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.fail(req.t('common.user-info-not-found', SPEED_LOCALE), { isValidationError: true });
            return;
        }

        const {
            kode_grup_pengangkutan,
            id_entitas,
            nib,
            nomor_kendaraan,
            id_operator_pengangkut,
            nomor_dokumen_manifest,
            lintang,
            bujur,
            waktu_serah_terima,
            waktu_mulai,
            hanya_baca,
        } = req.body;

        const repo = new SpeedHandoverRepositoryImpl();
        const useCase = new HandoverSpeedTransportWaste(repo);

        const result = await useCase.execute({
            groupCodes: parseStringList(kode_grup_pengangkutan),
            entityId: parseOptionalInt(id_entitas),
            nib: nib ? String(nib) : undefined,
            vehicleNumber: String(nomor_kendaraan),
            transporterOperatorId: id_operator_pengangkut ? String(id_operator_pengangkut) : undefined,
            manifestDocNumber: nomor_dokumen_manifest ? String(nomor_dokumen_manifest) : undefined,
            manifestFile: req.file
                ? {
                      originalname: req.file.originalname,
                      buffer: req.file.buffer,
                      mimetype: req.file.mimetype,
                  }
                : undefined,
            latitude: lintang !== undefined ? Number(lintang) : undefined,
            longitude: bujur !== undefined ? Number(bujur) : undefined,
            handoverTimestamp: new Date(waktu_serah_terima),
            startTime: new Date(waktu_mulai),
            isReadOnly: parseBooleanField(hanya_baca),
            transporterId: req.user.entity.id,
            transporterUpdatedBy: req.user.user_uuid,
        });

        if (typeof result === 'string') {
            res.fail(TRANSPORT_ERROR_MESSAGES[result] ?? result, { isValidationError: true });
            return;
        }

        res.success(result);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error', SPEED_LOCALE));
        }
    }
}

const TREATMENT_ERROR_MESSAGES: Record<string, string> = {
    INVALID_GROUP_IDS: 'Kode grup pengangkutan tidak valid',
    NOT_FOUND: 'Data tidak ditemukan',
    WASTE_TRANSPORTATION_GROUP_NOT_FOUND: 'Grup pengangkutan tidak ditemukan',
    TRANSPORTATION_GROUP_NOT_FOUND: 'Grup pengangkutan tidak ditemukan',
};

export async function handoverSpeedTreatment(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.fail(req.t('common.user-info-not-found', SPEED_LOCALE), { isValidationError: true });
            return;
        }

        const {
            kode_grup_pengangkutan,
            id_pihak_ketiga,
            nib,
            id_lokasi_pengolahan,
            id_operator_pengangkut,
            waktu_mulai_pengolahan,
            waktu_akhir_pengolahan,
        } = req.body;

        const repo = new SpeedHandoverRepositoryImpl();
        const useCase = new HandoverSpeedTreatmentWaste(repo);

        const result = await useCase.execute({
            groupCodes: parseStringList(kode_grup_pengangkutan),
            thirdPartyId: parseOptionalInt(id_pihak_ketiga),
            nib: nib ? String(nib) : undefined,
            treatmentLocationId: Number(id_lokasi_pengolahan),
            transporterOperatorId: id_operator_pengangkut ? String(id_operator_pengangkut) : undefined,
            startTime: new Date(waktu_mulai_pengolahan),
            endTime: new Date(waktu_akhir_pengolahan),
            updatedBy: req.user.user_uuid,
        });

        if (typeof result === 'string') {
            res.fail(TREATMENT_ERROR_MESSAGES[result] ?? result, { isValidationError: true });
            return;
        }

        res.success(result);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error', SPEED_LOCALE));
        }
    }
}
