import { Op } from 'sequelize';
import WasteClassification from '../../../domain/entities/WasteClassification';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';
import UpdateWasteClassificationDTO from '../../dtos/UpdateWasteClassificationDTO';

export default class UpdateWasteClassificationUseCase {
    constructor(
        private readonly wasteClassificationRepository: WasteClassificationRepository,
        private readonly wasteHierarchyRepository: WasteHierarchyRepository,
    ) {}

    async execute(data: UpdateWasteClassificationDTO): Promise<WasteClassification | null> {
        try {
            const {
                id,
                regionId,
                updatedBy,
                effectiveFrom,
                effectiveTo,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
                wasteCode,
                wasteBagColorCode,
                storageRuleType,
                useColdStorage,
                coldStorageMinHours,
                coldStorageMaxHours,
                tempStorageMinHours,
                tempStorageMaxHours,
                minimunDecayDay,
                storageRule,
                hasMultipleTransporters,
                allowHealthcareFacilityTreatment,
                treatmentMethod,
                disposalMethod,
                allowedVehicleTypes,
            } = data;

            const existingData =
                await this.wasteClassificationRepository.getWasteClassificationById(id);

            if (!existingData) {
                return null;
            }

            let existingDataWasteType: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                    id: wasteTypeId,
                });
            if (!existingDataWasteType) {
                console.error(`Waste hierarchy with ID ${wasteTypeId} not found`);
                throw new Error(`Waste hierarchy with ID ${wasteTypeId} not found`);
            }

            let existingDataWasteGroup: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                    id: wasteGroupId,
                });
            if (!existingDataWasteGroup) {
                console.error(`Waste hierarchy with ID ${wasteGroupId} not found`);
                throw new Error(`Waste hierarchy with ID ${wasteGroupId} not found`);
            }

            let existingDataWasteCharacteristics: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                    id: wasteCharacteristicsId,
                });
            if (!existingDataWasteCharacteristics) {
                console.error(`Waste hierarchy with ID ${wasteCharacteristicsId} not found`);
                throw new Error(`Waste hierarchy with ID ${wasteCharacteristicsId} not found`);
            }

            const getDataOtherThisId: any =
                await this.wasteClassificationRepository.findWasteClassificationByCondition({
                    wasteCharacteristicsId: wasteCharacteristicsId,
                    id: {
                        [Op.notIn]: [id],
                    },
                });

            if (getDataOtherThisId) {
                console.error(`waste specification for the selected waste characteristic has already been configured.
                    Please proceed with other waste characteristic name.`);
                throw new Error(`waste specification for the selected waste characteristic has already been configured.
                    Please proceed with other waste characteristic name.`);
            }

            if (
                wasteTypeId === wasteGroupId ||
                wasteTypeId === wasteCharacteristicsId ||
                wasteGroupId === wasteCharacteristicsId
            ) {
                console.error(
                    `wasteTypeId or wasteGroupId or wasteCharacteristicsId cannot be the same value`,
                );
                throw new Error(
                    `wasteTypeId or wasteGroupId or wasteCharacteristicsId cannot be the same value`,
                );
            }

            const wasteClassificationData: WasteClassification = new WasteClassification({
                ...existingData,
                regionId: regionId ?? existingData.regionId,
                effectiveFrom: effectiveFrom ?? existingData.effectiveFrom,
                effectiveTo: effectiveTo ?? existingData.effectiveTo,
                wasteTypeId: wasteTypeId ?? existingData.wasteTypeId,
                wasteGroupId: wasteGroupId ?? existingData.wasteGroupId,
                wasteCharacteristicsId:
                    wasteCharacteristicsId ?? existingData.wasteCharacteristicsId,
                wasteCode: wasteCode ?? existingData.wasteCode,
                wasteBagColorCode: wasteBagColorCode ?? existingData.wasteBagColorCode,
                storageRuleType: storageRuleType ?? existingData.storageRuleType,
                useColdStorage: useColdStorage ?? existingData.useColdStorage,
                coldStorageMinHours: coldStorageMinHours ?? existingData.coldStorageMinHours,
                coldStorageMaxHours: coldStorageMaxHours ?? existingData.coldStorageMaxHours,
                tempStorageMinHours: tempStorageMinHours ?? existingData.tempStorageMinHours,
                tempStorageMaxHours: tempStorageMaxHours ?? existingData.tempStorageMaxHours,
                minimunDecayDay: minimunDecayDay ?? existingData.minimunDecayDay,
                storageRule: storageRule ?? existingData.storageRule,
                allowHealthcareFacilityTreatment:
                    allowHealthcareFacilityTreatment ??
                    existingData.allowHealthcareFacilityTreatment,
                treatmentMethod: treatmentMethod ?? null,
                disposalMethod: disposalMethod ?? existingData.disposalMethod,
                allowedVehicleTypes: allowedVehicleTypes ?? null,
                hasMultipleTransporters: hasMultipleTransporters,
                updatedBy: updatedBy,
                updatedAt: new Date(),
            });

            await this.wasteClassificationRepository.updateWasteClassification(
                wasteClassificationData,
            );
            const dataWasteClassification =
                await this.wasteClassificationRepository.getWasteClassificationById(data.id);
            console.log('Waste classification updated successfully:', dataWasteClassification);
            return dataWasteClassification;
        } catch (error) {
            console.error('Error updating waste source group:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
