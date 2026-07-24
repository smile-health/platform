import WasteClassification from '../../../domain/entities/WasteClassification';
import RegionRepository from '../../../domain/repositories/RegionRepository';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';
import CreateWasteClassificationDTO from '../../dtos/CreateWasteClassificationDTO';

export default class CreateWasteUseCase {
    constructor(
        private readonly wasteClassificationRepository: WasteClassificationRepository,
        private readonly regionRepository: RegionRepository,
        private readonly wasteHierarchyRepository: WasteHierarchyRepository,
    ) {}

    async execute(data: CreateWasteClassificationDTO): Promise<WasteClassification> {
        try {
            let {
                regionId,
                createdBy,
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
                allowHealthcareFacilityTreatment,
                isActive,
                hasMultipleTransporters,
                treatmentMethod,
                disposalMethod,
                allowedVehicleTypes,
            } = data;

            let existingDataRegion: any = await this.regionRepository.getOneRegion();
            if (!existingDataRegion) {
                console.error(`Region not found`);
                throw new Error('Region not found');
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

            const dataWasteClassificationBywasteCharacteristicsId: any =
                await this.wasteClassificationRepository.findWasteClassificationByCondition({
                    wasteCharacteristicsId: wasteCharacteristicsId,
                });

            if (dataWasteClassificationBywasteCharacteristicsId) {
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

            if (!effectiveFrom || !effectiveTo) {
                effectiveFrom = new Date(Date.now());
                effectiveTo = new Date(9999, 11, 30);
            }

            if (!regionId) {
                regionId = existingDataRegion.id;
            }

            const wasteClassification: WasteClassification = new WasteClassification({
                regionId,
                createdAt: new Date(),
                createdBy,
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
                allowHealthcareFacilityTreatment,
                isActive,
                hasMultipleTransporters,
                treatmentMethod,
                disposalMethod,
                allowedVehicleTypes,
            });

            await this.wasteClassificationRepository.createWasteClassification(wasteClassification);
            console.log('Waste classification created successfully(execute):', wasteClassification);
            return wasteClassification;
        } catch (error) {
            console.error('Error creating waste classification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
