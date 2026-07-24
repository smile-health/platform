import { Op } from 'sequelize';
import Partnership from '../../../domain/entities/Partnership';
import PartnershipRepository from '../../../domain/repositories/PartnershipRepository';
import CreatePartnershipDTO from '../../dtos/CreatePartnershipDTO';
import { PartnershipStatusUpdateService } from '../../../domain/services/PartnershipStatusUpdateService';
import NotificationServiceRepository from '../../../domain/services/NotificationService';
import { NOTIFICATION_EVENT_TYPE } from '../../../shared/types/notificationHelper';
import { getEntityDetail } from '../../../infrastructure/external-apis/thirdPartyClient';
import WasteClassificationModel from '../../../infrastructure/database/models/WasteClassificationModel';

export default class CreatePartnershipUseCase {
    constructor(
        private readonly model: PartnershipRepository,
        private readonly services: PartnershipStatusUpdateService,
        private readonly notificationService: NotificationServiceRepository,
    ) {}

    async execute(
        data: CreatePartnershipDTO,
        token: string,
    ): Promise<Partnership[] | Partnership | null> {
        try {
            const {
                contractStartDate,
                contractEndDate,
                contractId,
                partnershipStatus,
                providerType,
                hasIncinerator,
                hasAutoclave,
                consumerId,
                consumerType,
                providerId,
                picName,
                picPosition,
                picPhoneNumber,
                createdBy,
                transporterId,
                wasteClassification,
            } = data;

            // if (transporterId === null && wasteClassificationId === undefined) {
            if (!wasteClassification || wasteClassification.length === 0) {
                console.error(`wasteClassification must not be empty`);
                throw new Error(`wasteClassification must not be empty`);
            }

            const partnerships: Partnership[] = [];

            for await (const wc of wasteClassification) {
                const { wasteClassificationId, price, providerTypes } = wc;
                let resolvedProviderType = providerTypes;

                //find waste classification allow multiple transporter
                const wasteClassificationMultipleTransporter =
                    await WasteClassificationModel.findOne({
                        attributes: ['id', 'hasMultipleTransporters'],
                        where: {
                            id: wasteClassificationId,
                        },
                    });
                
                    const hasMultipleTransporters =
                        wasteClassificationMultipleTransporter?.dataValues.hasMultipleTransporters;
                if (transporterId === null) {
                    resolvedProviderType = providerType;
                    const existingDataPartnershipByConsumerId: any =
                        await this.model.findPartnershipByCondition({
                            consumerId: consumerId,
                            partnershipStatus: 'ACTIVE',
                            wasteClassificationId: wasteClassificationId,
                            providerType: {
                                [Op.in]: [
                                    'TRANSPORTER',
                                    'TRANSPORTER_RECYCLER',
                                    'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                                    'TRANSPORTER_LANDFILL',
                                    'TRANSPORTER_TREATMENT',
                                    'TRANSPORTER_GOVERNMENT',
                                    'TRANSPORTER_GOVERNMENT_WASTE_BANK',
                                    'SPECIALIZED_TREATMENT_PROVIDER',
                                ],
                            },
                        });

                    if (!hasMultipleTransporters) {
                        if (existingDataPartnershipByConsumerId) {
                            const message =
                                `Partnership with providerId ${providerId} ` +
                                `and wasteClassificationId ${wasteClassificationId} already exists`;

                            console.error(message);
                            throw new Error(message);
                        }
                    } else {
                        const existingDataPartnershipByConsumerId: any =
                            await this.model.findPartnershipByCondition({
                                consumerId: consumerId,
                                partnershipStatus: 'ACTIVE',
                                providerId: providerId,
                                wasteClassificationId: wasteClassificationId,
                                providerType: {
                                    [Op.in]: [
                                        'TRANSPORTER',
                                        'TRANSPORTER_RECYCLER',
                                        'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER',
                                        'TRANSPORTER_LANDFILL',
                                        'TRANSPORTER_TREATMENT',
                                        'TRANSPORTER_GOVERNMENT',
                                        'TRANSPORTER_GOVERNMENT_WASTE_BANK',
                                        'SPECIALIZED_TREATMENT_PROVIDER',
                                    ],
                                },
                            });
                        if (existingDataPartnershipByConsumerId) {
                            const message =
                                `Partnership with providerId ${providerId} ` +
                                `and wasteClassificationId ${wasteClassificationId} already exists`;

                            console.error(message);
                            throw new Error(message);
                        }
                    }
                } else {
                    let existingData = await this.model.findPartnershipByCondition({
                        providerId: providerId,
                        consumerId: consumerId,
                        partnershipStatus: 'ACTIVE',
                        wasteClassificationId: wasteClassificationId,
                        providerType: {
                            [Op.in]: ['RECYCLER', 'TREATMENT', 'LANDFILLER'],
                        },
                    });
                    if(hasMultipleTransporters){
                        existingData = await this.model.findPartnershipByCondition({
                            providerId: providerId,
                            consumerId: consumerId,
                            partnershipStatus: 'ACTIVE',
                            wasteClassificationId: wasteClassificationId,
                            providerType: {
                                [Op.in]: ['RECYCLER', 'TREATMENT', 'LANDFILLER'],
                            },
                            transporterId: transporterId
                        });
                    }

                    if (existingData) {
                        console.error(
                            `Partnership with providerId ${providerId} and wasteClassificationId ${wasteClassificationId} already exists`,
                        );
                        throw new Error(
                            `Partnership with providerId ${providerId} and wasteClassificationId ${wasteClassificationId} already exists`,
                        );
                    }
                }

                const dataInput: Partnership = new Partnership({
                    consumerId,
                    consumerType,
                    wasteClassificationId,
                    providerId,
                    contractStartDate,
                    contractEndDate,
                    contractId,
                    partnershipStatus,
                    providerType: resolvedProviderType,
                    hasIncinerator,
                    hasAutoclave,
                    picName,
                    picPosition,
                    picPhoneNumber,
                    pricePerKg: price,
                    createdBy,
                    createdAt: new Date(),
                    updatedBy: createdBy,
                    updatedAt: new Date(),
                    transporterId: transporterId,
                });

                const partnershipData = await this.model.createPartnership(dataInput);

                if (partnershipData) {
                    const entityHf = await getEntityDetail(partnershipData.consumerId, token);
                    const entityPartnership = await getEntityDetail(
                        partnershipData.providerId,
                        token,
                    );

                    this.services.logInfo(
                        'Partnership created successfully',
                        'PARTNERSHIP_CONTRACT_EXPIRED',
                        {
                            partnershipId: partnershipData.id,
                            createdBy: partnershipData.createdBy,
                            startTime: partnershipData.contractStartDate,
                            endTime: partnershipData.contractEndDate,
                            user: data.user,
                            entity: data.entity,
                        },
                    );

                    await this.notificationService.sendMultiNotification(
                        data.user,
                        data.entity,
                        NOTIFICATION_EVENT_TYPE.PARTNERSHIP_CREATED.message({
                            healthcare_facility: entityHf.name,
                            third_party: entityPartnership.name,
                        }),
                        NOTIFICATION_EVENT_TYPE.PARTNERSHIP_CREATED.title,
                        NOTIFICATION_EVENT_TYPE.PARTNERSHIP_CREATED.type,
                        {
                            forSuperAdmin: true,
                            forAdmin: true,
                            forOperator: false,
                        },
                    );

                    partnerships.push(partnershipData);
                }
            }

            return partnerships.length > 0 ? partnerships : null;
        } catch (error) {
            console.error('Error creating Partnership:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
