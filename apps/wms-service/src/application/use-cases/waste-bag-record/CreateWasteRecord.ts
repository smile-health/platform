import WasteBagRecord from '../../../domain/entities/WasteBagRecord';
import WasteBagRecordRepository from '../../../domain/repositories/WasteBagRecordRepository';
import CreateWasteDTO from '../../dtos/CreateWasteDTO';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';

export default class CreateWasteBagRecordUseCase {
    constructor(
        private readonly wasteBagRepository: WasteBagRecordRepository,
        private readonly wasteClassification: WasteClassificationRepository,
    ) {}

    async execute(token: string, data: CreateWasteDTO): Promise<WasteBagRecord | string> {
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
                assetId
            } = data;

            const getWasteClassification =
                await this.wasteClassification.getWasteClassificationById(wasteClassificationId);

            if (!getWasteClassification) {
                return `WASTE_CLASSIFICATION_NOT_FOUND`;
            }

            let wasteBagPayload: WasteBagRecord;

            const startDate = new Date();
            const scheduledStorageEndDatetime = new Date(
                startDate.getTime() +
                    Number(getWasteClassification.tempStorageMaxHours) * 60 * 60 * 1000,
            );

            wasteBagPayload = new WasteBagRecord({
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
                wasteGroupIds,
                bastNo,
                materialIds,
                assetId,
            });

            const createdWasteBagRecord = await this.wasteBagRepository.createWasteBagRecord(
                wasteBagPayload,
                token,
            );

            if (typeof createdWasteBagRecord === 'string') {
                return createdWasteBagRecord;
            }

            return createdWasteBagRecord;
        } catch (error) {
            console.error('Error creating waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
