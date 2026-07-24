import WasteBag from '../../domain/entities/WasteBag';
import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import CreateWasteDTO from '../dtos/CreateWasteDTO';
import WasteClassificationRepository from '../../domain/repositories/WasteClassificationRepository';
import WasteBagModel from '../../infrastructure/database/models/WasteBagModel';
import { getEntityDetail } from '../../infrastructure/external-apis/thirdPartyClient';

export default class CreateWasteUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteStatusUpdateService: WasteStatusUpdateService,
        private readonly wasteClassification: WasteClassificationRepository,
    ) {}

    async execute(
        token: string,
        data: CreateWasteDTO,
        isRadioActive: boolean,
    ): Promise<WasteBag | string> {
        try {
            const {
                createdBy,
                healthcareFacilityId,
                scaleMethod,
                wasteClassificationId,
                sourceTreatmentGroupId,
                weightInKgs,
                wasteSourceId,
                wasteBagQrCodeId,
                binNumber,
                iotMethod,
                wasteGroupIds,
                isTreated,
                bastNo,
                materialIds,
                assetId,
                user,
                entity
            } = data;

            const getWasteClassification =
                await this.wasteClassification.getWasteClassificationById(wasteClassificationId);

            if (!getWasteClassification) {
                return `WASTE_CLASSIFICATION_NOT_FOUND`;
            }

            let wasteBagPayload: WasteBag;

            const checkData = await WasteBagModel.findOne({
                where: {
                    wasteBagQrCodeId: wasteBagQrCodeId
                }
            })

            const wasteGroupIdFormat = wasteGroupIds?.replace(/\s+/g, "");

            const startDate = new Date();
            const decayDay = Number(getWasteClassification.minimunDecayDay) + 1
            const scheduledStorageEndDatetime = isRadioActive
                ? new Date(
                      startDate.getTime() +
                          decayDay * 24 * 60 * 60 * 1000,
                  )
                : new Date(
                      startDate.getTime() +
                          Number(getWasteClassification.tempStorageMaxHours) * 60 * 60 * 1000,
                  );

            // check data wastebag exist or not if isRadioActive true
            if (isRadioActive && checkData) {
                checkData.set({
                    updatedAt: new Date(),
                    scaleMethod,
                    weightInKgs: Number(parseFloat(weightInKgs?.toString() ?? "").toFixed(3)),
                    binNumber,
                    iotMethod,
                    wasteGroupIds: wasteGroupIdFormat,
                    bastNo,
                    materialIds,
                    assetId,
                });

                checkData.save()

                return checkData.get({plain: true}) as WasteBag
            }

            wasteBagPayload = new WasteBag({
                healthcareFacilityId,
                createdAt: new Date(),
                createdBy,
                wasteSourceId,
                wasteClassificationId,
                sourceTreatmentGroupId,
                scheduledStorageEndDatetime,
                scaleMethod,
                weightInKgs,
                wasteStatus: 'IN_TEMPORARY_STORAGE',
                wasteBagQrCodeId,
                ownedBy: 'HEALTHCARE_FACILITY',
                isTreated: isTreated ?? false,
                isDisposed: false,
                binNumber,
                iotMethod,
                wasteGroupIds: wasteGroupIdFormat,
                bastNo,
                materialIds,
                assetId,
            });

            const createdWasteBag = await this.wasteBagRepository.createWasteBag(
                wasteBagPayload,
                token,
                isRadioActive,
            );

            if (typeof createdWasteBag === 'string') {
                return createdWasteBag;
            }

            // this.wasteStatusUpdateService.logInfo(
            //     'Waste bag created successfully',
            //     'WASTE_BAG_CREATED',
            //     {
            //         wasteBagId: createdWasteBag.wasteBagQrCodeId,
            //         ...createdWasteBag,
            //     },
            // );

            this.wasteStatusUpdateService.logInfo(
                'Waste bag created successfully',
                'WASTE_BAG_TEMPORARY_STORED',
                {
                    wasteBagId: createdWasteBag.wasteBagQrCodeId ?? wasteBagQrCodeId,
                    updatedBy: new Date(),
                    startTime: new Date(),
                    endTime: new Date(),
                    ...(!wasteGroupIds && { isGroup: true }),
                    user: user,
                    entity: entity,
                },
            );
            return createdWasteBag;
        } catch (error) {
            console.error('Error creating waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
