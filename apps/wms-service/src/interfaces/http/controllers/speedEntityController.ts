import { Request, Response } from 'express';
import SpeedEntityRepositoryImpl from '../../../infrastructure/database/repositories/SpeedEntityRepositoryImpl';
import GetAllSpeedEntities from '../../../application/use-cases/speed/GetAllSpeedEntities';
import GetSpeedEntityByNib from '../../../application/use-cases/speed/GetSpeedEntityByNib';

// SPEED responses are always Indonesian regardless of the partner's Accept-Language header.
const SPEED_LOCALE = { lng: 'id' };

// Invalid numeric input (e.g. `?id_provinsi=abc`) becomes `undefined` (filter ignored) instead
// of `NaN` reaching Sequelize's `where` clause.
function parseOptionalInt(value: unknown): number | undefined {
    if (value === undefined || value === '') return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
}

export async function getAllSpeedEntities(req: Request, res: Response): Promise<void> {
    try {
        const {
            halaman,
            batas,
            kata_kunci,
            id_jenis_entitas,
            id_provinsi,
            id_kabupaten_kota,
            id_kecamatan,
            id_kelurahan,
            id_satu_sehat,
            nib,
        } = req.query;

        const repo = new SpeedEntityRepositoryImpl();
        const useCase = new GetAllSpeedEntities(repo);

        const result = await useCase.execute({
            page: halaman ? Number(halaman) : undefined,
            limit: batas ? Number(batas) : undefined,
            search: kata_kunci ? String(kata_kunci) : undefined,
            entityTypeId: parseOptionalInt(id_jenis_entitas),
            provinceId: parseOptionalInt(id_provinsi),
            regencyId: parseOptionalInt(id_kabupaten_kota),
            subDistrictId: parseOptionalInt(id_kecamatan),
            villageId: parseOptionalInt(id_kelurahan),
            idSatuSehat: parseOptionalInt(id_satu_sehat),
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

export async function getSpeedEntityByNib(req: Request, res: Response): Promise<void> {
    try {
        const { nib } = req.params;

        const repo = new SpeedEntityRepositoryImpl();
        const useCase = new GetSpeedEntityByNib(repo);

        const data = await useCase.execute({ nib });

        if (!data) {
            res.fail(`Entitas dengan NIB ${nib} tidak ditemukan`, { isNotFoundError: true });
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
