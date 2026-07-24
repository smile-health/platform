import WasteBag from '../../../domain/entities/WasteBag';
import { AuditTrilStoreService } from '../../../domain/services/AuditTrailingService';
import { logMessage } from '../../../shared/types/rabbitmq';
import { WasteBagAuditTrailModel } from '../models/WasteBagAuditTrailModel';
import InfraRegistry from './infraRegistry';
import { paginationUtils } from '../../../shared/utils/pagination';
import WasteBagAuditTrail from '../../../domain/entities/WasteBagAuditTrail';

export default class WasteBagAuditTrailRepositoryImpl implements AuditTrilStoreService {
    async storeAuditTrail(payload: logMessage): Promise<void> {
        try {
            if (!payload.metadata || !payload.metadata.wasteBagId || !payload.event) {
                throw new Error('Invalid payload: Missing required metadata fields');
            }

            let wasteBag: WasteBag | null = null;
            if (!payload.metadata.healthcareFacilityId || !payload.metadata.wasteBagStatus) {
                wasteBag = await InfraRegistry.wasteBagRepositoryImpl!.getWasteBagById(
                    payload.metadata.wasteBagId as string,
                );
                if (!wasteBag) {
                    throw new Error(`Waste bag with ID ${payload.metadata.wasteBagId} not found`);
                }
            }

            await WasteBagAuditTrailModel.create({
                healthcare_facility_id:
                    (payload.metadata.healthcareFacilityId as number) ??
                    wasteBag!.healthcareFacilityId,
                waste_bag_id: payload.metadata.wasteBagId as string,
                event: payload.event as string,
                waste_bag_status:
                    (payload.metadata.wasteStatus as string) ?? wasteBag!.wasteStatus,
                transport_status: (payload.metadata.transportStatus as string) ?? undefined,
                source: (payload.metadata.source as string) ?? 'INTERNAL',
                remarks: payload.message as string,
                transporter_id: (payload.metadata.transporterId as number) ?? undefined,
                updated_by: (payload.metadata.updatedBy as string) ?? 'SYSTEM_GENERATED',
                third_party_provider_id:
                    (payload.metadata.thirdPartyProviderId as number) ?? undefined,
                is_group: (payload.metadata.isGroup as boolean) ?? false,
                is_failed: (payload.metadata.isFailed as boolean) ?? false,
            });
        } catch (error) {
            console.error('Error storing audit trail:', error);
            throw new Error(
                error instanceof Error
                    ? error.message
                    : 'An error occurred while storing audit trail',
            );
        }
    }

    async getAllWasteBagAuditTrails(
        limit: number,
        page: number,
        search?: string,
        wasteBagId?: string,
        healthcareFacilityId?: string,
        transporterId?: string,
        thirdPartyProviderId?: string,
    ): Promise<{
        data: WasteBagAuditTrail[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
            });
            const { count, rows } = await WasteBagAuditTrailModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['created_at', 'ASC']],
                where: {
                    ...(wasteBagId && {
                        waste_bag_id: wasteBagId,
                    }),
                    ...(healthcareFacilityId && {
                        healthcare_facility_id: healthcareFacilityId,
                    }),
                    ...(transporterId && {
                        transporter_id: transporterId,
                    }),
                    ...(thirdPartyProviderId && {
                        third_party_provider_id: thirdPartyProviderId,
                    }),
                },
            });

            return paginationUtils.formatPaginationResult(
                await Promise.all(
                    rows.map(async (data: any) => {
                        // Kumpulkan semua teks yang perlu diterjemahkan
                        // const textsToTranslate = [
                        //     data.get('event'),
                        //     data.get('waste_bag_status'),
                        //     data.get('source'),
                        //     data.get('remarks'),
                        // ];

                        // // Lakukan terjemahan sekaligus (lebih efisien)
                        // const [
                        //     translatedEvent,
                        //     translatedStatus,
                        //     translatedSource,
                        //     translatedRemarks,
                        // ] = await translateMultiple(textsToTranslate, 'en', 'id');

                        return new WasteBagAuditTrail({
                            id: data.get('id'),
                            createdAt: data.get('created_at'),
                            updatedBy: data.get('updated_by'),
                            wasteBagId: data.get('waste_bag_id'),
                            event: data.get('event'),
                            wasteBagStatus: data.get('waste_bag_status'),
                            transportStatus: data.get('transport_status'),
                            healthcareFacilityId: data.get('healthcare_facility_id'),
                            transporterId: data.get('transporter_id'),
                            thirdPartyProviderId: data.get('third_party_provider_id'),
                            source: data.get('source'),
                            remarks: data.get('remarks'),
                            isGroup: data.get('is_group'),
                            isFailed: data.get('is_failed'),
                        });
                    }),
                ),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving wastebag audit trail:', error);
            throw new Error('Error retrieving wastebag audit trail');
        }
    }
}
