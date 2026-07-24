import { Request, Response } from 'express';
import SpeedWasteRepositoryImpl from '../../../infrastructure/database/repositories/SpeedWasteRepositoryImpl';
import GetAllSpeedWaste from '../../../application/use-cases/speed/GetAllSpeedWaste';
import GetSpeedWasteById from '../../../application/use-cases/speed/GetSpeedWasteById';
import GetSpeedWasteAggregate from '../../../application/use-cases/speed/GetSpeedWasteAggregate';

// SPEED responses are always Indonesian regardless of the partner's Accept-Language header.
const SPEED_LOCALE = { lng: 'id' };

// Invalid numeric input (e.g. `?id_entitas=abc`) becomes `undefined` (filter ignored) instead
// of `NaN` — consistent with parseNumberList/parseWasteClassificationId below, and avoids the
// previous truthy-check bugs that also silently dropped a legitimate `0`.
function parseOptionalInt(value: unknown): number | undefined {
    if (value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
}

function parseWasteClassificationId(value: unknown): number[] | undefined {
    if (!value) return undefined;
    const raw = String(value);
    // Accept a bare number too (e.g. `?id_klasifikasi_limbah=5`), not just a JSON array —
    // partners forgetting to wrap a single id in `[]` shouldn't have the filter silently dropped.
    if (/^-?\d+$/.test(raw.trim())) {
        return [Number(raw)];
    }
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : undefined;
    } catch {
        return undefined;
    }
}

// Comma-separated multi-value filter, e.g. `?id_karakteristik_limbah=1,2,3` — also accepts a
// single bare number. Invalid individual elements are dropped, not the whole filter; only an
// empty/all-invalid result becomes `undefined` (filter not applied).
function parseNumberList(value: unknown): number[] | undefined {
    if (!value) return undefined;
    const numbers = String(value)
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map(Number)
        .filter((n) => !Number.isNaN(n));
    return numbers.length ? numbers : undefined;
}

export async function getAllSpeedWaste(req: Request, res: Response): Promise<void> {
    try {
        const {
            halaman,
            batas,
            id,
            id_entitas,
            nib,
            id_pengangkut,
            id_pihak_ketiga,
            id_klasifikasi_limbah,
            dimiliki_oleh,
            status_limbah,
            kode_kantong_limbah,
            id_jenis_limbah,
            id_kelompok_limbah,
            id_karakteristik_limbah,
        } = req.query;

        const repo = new SpeedWasteRepositoryImpl();
        const useCase = new GetAllSpeedWaste(repo);

        const result = await useCase.execute({
            page: halaman ? Number(halaman) : undefined,
            limit: batas ? Number(batas) : undefined,
            id: parseOptionalInt(id),
            entityId: parseOptionalInt(id_entitas),
            nib: nib ? String(nib) : undefined,
            transporterId: parseOptionalInt(id_pengangkut),
            thirdPartyId: parseOptionalInt(id_pihak_ketiga),
            wasteClassificationId: parseWasteClassificationId(id_klasifikasi_limbah),
            ownedBy: dimiliki_oleh ? String(dimiliki_oleh) : undefined,
            wasteStatus: status_limbah ? String(status_limbah) : undefined,
            wasteBagCode: kode_kantong_limbah ? String(kode_kantong_limbah) : undefined,
            wasteTypeId: parseNumberList(id_jenis_limbah),
            wasteGroupId: parseNumberList(id_kelompok_limbah),
            wasteCharacteristicsId: parseNumberList(id_karakteristik_limbah),
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

export async function getSpeedWasteById(req: Request, res: Response): Promise<void> {
    try {
        const { kode_kantong_limbah } = req.params;

        const repo = new SpeedWasteRepositoryImpl();
        const useCase = new GetSpeedWasteById(repo);

        const data = await useCase.execute({ wasteBagCode: kode_kantong_limbah });

        if (!data) {
            res.fail(`Limbah dengan kode ${kode_kantong_limbah} tidak ditemukan`, { isNotFoundError: true });
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

/**
 * Response envelope for this endpoint deliberately deviates from the platform's usual
 * {status, data} convention (res.success/res.fail) — the SPEED spec for this specific
 * endpoint calls for {kode, pesan, data} with snake_case fields. Matching the contract
 * literally here, not "fixing" it to the platform convention.
 */
export async function getSpeedWasteAggregate(req: Request, res: Response): Promise<void> {
    try {
        const { tanggal_mulai, tanggal_akhir, id_entitas, nib } = req.query;

        const repo = new SpeedWasteRepositoryImpl();
        const useCase = new GetSpeedWasteAggregate(repo);

        const data = await useCase.execute({
            startDate: tanggal_mulai ? String(tanggal_mulai) : undefined,
            endDate: tanggal_akhir ? String(tanggal_akhir) : undefined,
            entityId: parseOptionalInt(id_entitas),
            nib: nib ? String(nib) : undefined,
        });

        res.status(200).json({ kode: 200, pesan: 'Success Get Detail Aggregate', data });
    } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : req.t('common.server-error', SPEED_LOCALE);
        res.status(500).json({ kode: 500, pesan: message, data: null });
    }
}
