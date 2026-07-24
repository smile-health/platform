import { Request, Response } from 'express';
import LogBookExportExcelRepositoryImpl from '../../../infrastructure/database/repositories/LogBookExportExcelRepositoryImpl';
import LogBookExportExcelUseCase from '../../../application/use-cases/export-excel/LogBookExportExcelUseCase';

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

// Helper: amanin input buat jadi bagian dari nama file
const safe = (s: unknown) =>
    String(s ?? '')
        .trim()
        .replace(/[^\w.-]+/g, '-')
        .slice(0, 100); // jaga-jaga biar nggak kepanjangan

// Helper: Content-Disposition dengan fallback ASCII + RFC5987
function buildContentDisposition(filename: string) {
    const ascii = filename.replace(/[^\x20-\x7E]/g, '_');
    const rfc5987 = encodeURIComponent(filename);
    return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}

export async function getLogBookExportExcel(req: Request, res: Response): Promise<void> {
    try {
        const {
            startDate,
            endDate,
            healthcareFacilityId,
            provinceId,
            regencyId,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            format,
        } = req.query;

        if (!startDate || !endDate) {
            throw new Error('startDate and endDate are required.');
        }
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), { isValidationError: true });
            return;
        }
        const token = authHeader.slice('Bearer '.length);

        // Eksekusi use case
        const repo = new LogBookExportExcelRepositoryImpl();
        const useCase = new LogBookExportExcelUseCase(repo);

        const entityId = req.user?.entity?.id;
        const entityType = req.user?.entity?.entity_type?.name;

        const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');

        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];

        let resolvedHealthcareId = healthcareFacilityId;
        if (entityId && allowedTypes.includes(entityType) && !isSuperAdmin) {
            resolvedHealthcareId = entityId.toString();
        }

        const fileFormat = (format as string)?.toLowerCase() || 'excel';
        if (fileFormat === 'pdf') {
            const repo = new LogBookExportExcelRepositoryImpl();
            const useCase = new LogBookExportExcelUseCase(repo);
            const buffer = await repo.getWasteBagLogBookForExportPdf(
                String(startDate),
                String(endDate),
                Number(resolvedHealthcareId?.toString()),
            );

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                `attachment; filename="LogBook_${resolvedHealthcareId}_${startDate}_${endDate}.pdf"`,
            );
            res.send(buffer);
        } else {
            const result = await useCase.execute(
                String(startDate),
                String(endDate),
                Number(resolvedHealthcareId?.toString()),
                Number(provinceId?.toString()),
                Number(regencyId?.toString()),
                Number(wasteTypeId?.toString()),
                Number(wasteGroupId?.toString()),
                Number(wasteCharacteristicsId?.toString()),
            );

            const buffer: Buffer = Buffer.isBuffer(result)
                ? result
                : Buffer.from(result as ArrayBuffer);

            const filename = `logbook_${resolvedHealthcareId}_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': buildContentDisposition(filename),
                'Cache-Control': 'no-store',
                'Content-Length': buffer.length.toString(),
            });

            res.status(200).send(buffer);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
