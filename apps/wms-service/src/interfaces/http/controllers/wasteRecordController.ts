import { Request, Response } from 'express';
import WasteBagRecordRepositoryImpl from '../../../infrastructure/database/repositories/WasteBagRecordRepositoryImpl';
import CreateWasteBagRecordUseCase from '../../../application/use-cases/waste-bag-record/CreateWasteRecord';
import CreateWasteDTO from '../../../application/dtos/CreateWasteDTO';
import GetAllWasteBagRecordUseCase from '../../../application/use-cases/waste-bag-record/GetAllWasteBagRecord';
import WasteClassificationRepositoryImpl from '../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';
import WasteTrackingExportExcelRepositoryImpl from '../../../infrastructure/database/repositories/WasteTrackingExportExcelRepositoryImpl';
import WasteRecordCharacteristicsSummaryExportExcelUseCase from '../../../application/use-cases/export-excel/WasteRecordCharacteristicsExportExcelUseCase';

export async function getAllWasteRecordController(req: Request, res: Response) {
    try {
        const {
            limit,
            page,
            search,
            healthcareId,
            transporterId,
            thirdPartyId,
            wasteUpdateStart,
            wasteUpdateEnd,
            wasteClassificationId,
            transportationGroupId,
            transportationExternalGroupId,
            treatmentGroupId,
            treatmentExternalGroupId,
            sourceType,
            ownedBy,
            wasteStatus,
            binNumber,
            wasteBagQrCodeId,
            id,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isTreated,
            isDisposed,
        } = req.query;

        const repo = new WasteBagRecordRepositoryImpl();
        const useCase = new GetAllWasteBagRecordUseCase(repo);

        let entityType = req.user?.entity.entity_type.name;
        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('Super Admin');
        let entityTag = req.user?.entity.tag.toString();
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (allowedTypes.includes(entityType) && !isSuperAdmin) {
            entityTag = 'hospital';
        }

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page),
            search?.toString(),
            Number(healthcareId?.toString()),
            Number(transporterId?.toString()),
            Number(thirdPartyId?.toString()),
            wasteUpdateStart?.toString(),
            wasteUpdateEnd?.toString(),
            wasteClassificationId ? (JSON.parse(wasteClassificationId.toString()) as number[]) : [],
            Number(transportationGroupId?.toString()),
            Number(transportationExternalGroupId?.toString()),
            Number(treatmentGroupId?.toString()),
            Number(treatmentExternalGroupId?.toString()),
            sourceType?.toString(),
            ownedBy?.toString(),
            wasteStatus?.toString(),
            binNumber?.toString(),
            wasteBagQrCodeId?.toString(),
            Number(id?.toString()),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isTreated?.toString() === 'true',
            isDisposed?.toString() === 'true',
            entityTag,
            req.user?.entity.id,
        );

        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}


export async function createWasteRecordController(req: Request, res: Response) {
    try {
        const repo = new WasteBagRecordRepositoryImpl();
        const wasteClassification = new WasteClassificationRepositoryImpl();
        const useCase = new CreateWasteBagRecordUseCase(repo, wasteClassification);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const payload: CreateWasteDTO = {
            ...req.body,
            healthcareFacilityId: req.user?.entity.id,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        };
        const wasteBag = await useCase.execute(token, payload);

        if (typeof wasteBag === 'string') {
            res.fail(req.t(`waste.error.${wasteBag}`), {
                message: req.t(`waste.error.${wasteBag}`),
            });
            return;
        }
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

const safe = (s: unknown) =>
    String(s ?? '')
        .trim()
        .replace(/[^\w.-]+/g, '-')
        .slice(0, 100);

function tsForFilename(tz = 'Asia/Jakarta') {
    const d = new Date();
    const dtf = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    const parts = Object.fromEntries(dtf.formatToParts(d).map((p) => [p.type, p.value]));
    return `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
}

function buildContentDisposition(filename: string) {
    const ascii = filename.replace(/[^\x20-\x7E]/g, '_');
    const rfc5987 = encodeURIComponent(filename);
    return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}

export async function getWasteRecordCharacteristicsSummaryExportExcel(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { startDate, endDate, provinceId, regencyId, healthcareFacilityId } = req.query;

        if (!startDate || !endDate) {
            throw new Error('startDate and endDate are required.');
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), { isValidationError: true });
            return;
        }
        const token = authHeader.slice('Bearer '.length); // disiapkan kalau use case butuh token

        // Eksekusi use case
        const repo = new WasteTrackingExportExcelRepositoryImpl();
        const useCase = new WasteRecordCharacteristicsSummaryExportExcelUseCase(repo);

        const entityId = req.user?.entity?.id;
        const entityType = req.user?.entity?.entity_type?.name;

        const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');

        let resolvedHealthcareId = healthcareFacilityId;
        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (entityId && allowedTypes.includes(entityType) && !isSuperAdmin) {
            resolvedHealthcareId = entityId.toString();
        }

        const result = await useCase.execute(
            String(startDate),
            String(endDate),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(resolvedHealthcareId?.toString()),
        );

        const buffer: Buffer = Buffer.isBuffer(result)
            ? result
            : Buffer.from(result as ArrayBuffer);

        const filename = `waste_characteristics_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': buildContentDisposition(filename),
            'Cache-Control': 'no-store',
            'Content-Length': buffer.length.toString(),
        });

        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
