import { Op } from 'sequelize';
import DataEntity from '../../../domain/entities/Partnership';
import EntityRepository from '../../../domain/repositories/PartnershipRepository';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { PartnershipStatusUpdateService } from '../../../domain/services/PartnershipStatusUpdateService';
import { ScheduledEventsModel } from '../../../infrastructure/database/models/ScheduledEvents';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';
import UpdateEntityDTO from '../../dtos/UpdatePartnershipDTO';

export default class UpdatePartnershipUseCase {
    constructor(
        private readonly model: EntityRepository,
        private readonly services: PartnershipStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(data: UpdateEntityDTO): Promise<DataEntity | null> {
        try {
            const {
                id,
                contractStartDate,
                contractEndDate,
                contractId,
                partnershipStatus,
                providerType,
                hasIncinerator,
                hasAutoclave,
                consumerId,
                consumerType,
                wasteClassificationId,
                providerId,
                picName,
                picPosition,
                picPhoneNumber,
                pricePerKg,
                updatedBy,
            } = data;

            if (!id) {
                throw new Error('ID is required to update an asset model');
            }

            const existingData = await this.model.getPartnershipById(id.toString(), data.token);

            if (!existingData) {
                return null;
            }

            const updatedData: DataEntity = new DataEntity({
                ...existingData,
                contractStartDate: contractStartDate ?? existingData.contractStartDate,
                contractEndDate: contractEndDate ?? existingData.contractEndDate,
                contractId: contractId ?? existingData.contractId,
                partnershipStatus: partnershipStatus ?? existingData.partnershipStatus,
                providerType: providerType ?? existingData.providerType,
                hasIncinerator: hasIncinerator ?? existingData.hasIncinerator,
                hasAutoclave: hasAutoclave ?? existingData.hasAutoclave,
                updatedBy: updatedBy ?? existingData.updatedBy,
                consumerId: consumerId ?? existingData.consumerId,
                consumerType: consumerType ?? existingData.consumerType,
                wasteClassificationId: wasteClassificationId ?? existingData.wasteClassificationId,
                providerId: providerId ?? existingData.providerId,
                picName: picName ?? existingData.picName,
                picPosition: picPosition ?? existingData.picPosition,
                picPhoneNumber: picPhoneNumber ?? existingData.picPhoneNumber,
                pricePerKg: pricePerKg ?? existingData.pricePerKg,
                updatedAt: new Date(),
            });

            await this.model.updatePartnership(updatedData);
            console.log('Partnership updated successfully:', updatedData);

            await this.notificationService.sendMultiNotification(
                data.user,
                data.entity,
                NOTIFICATION_EVENT_TYPE.PARTNERSHIP_UPDATED.message({
                    contract_id: id,
                }),
                NOTIFICATION_EVENT_TYPE.PARTNERSHIP_UPDATED.title,
                NOTIFICATION_EVENT_TYPE.PARTNERSHIP_UPDATED.type,
                {
                    forSuperAdmin: true,
                    forAdmin: true,
                    forOperator: false,
                },
            );

            await ScheduledEventsModel.update(
                { deletedBy: data.user.id },
                {
                    where: {
                        eventType: 'PARTNERSHIP_CONTRACT_EXPIRED',
                        metadata: {
                            [Op.like]: `%\"partnershipId\":${existingData.id}%`,
                        },
                    },
                },
            );
            await ScheduledEventsModel.destroy({
                where: {
                    eventType: 'PARTNERSHIP_CONTRACT_EXPIRED',
                    metadata: {
                        [Op.like]: `%\"partnershipId\":${existingData.id}%`,
                    },
                },
            });

            this.services.logInfo(
                'Partnership updated successfully',
                'PARTNERSHIP_CONTRACT_EXPIRED',
                {
                    partnershipId: existingData.id,
                    createdBy: existingData.createdBy,
                    startTime: contractStartDate ?? existingData.contractStartDate,
                    endTime: contractEndDate,
                    user: data.user,
                    entity: data.entity,
                },
            );

            return updatedData;
        } catch (error) {
            console.error('Error updating Partnership:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
