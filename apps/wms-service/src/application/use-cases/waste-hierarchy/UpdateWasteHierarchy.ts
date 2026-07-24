import { Op } from 'sequelize';
import WasteHierarchy from '../../../domain/entities/WasteHierarchy';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';
import UpdateWasteHierarchyDTO from '../../dtos/UpdateWasteHierarchyDTO';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';

export default class UpdateWasteHierarchyUseCase {
    constructor(
        private readonly wasteHierarchyRepository: WasteHierarchyRepository,
        private readonly wasteClassificationRepository: WasteClassificationRepository,
    ) {}

    async execute(data: UpdateWasteHierarchyDTO): Promise<WasteHierarchy | null> {
        try {
            const { id, name, nameEn, description, descriptionEn, parentHierarchyId, isResidue, isActive, updatedBy } =
                data;

            if (!id) {
                throw new Error('ID parameter is required');
            }
            const existingDataWasteHierarchy: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({ id: id });

            if (
                existingDataWasteHierarchy &&
                existingDataWasteHierarchy.level > 0 &&
                existingDataWasteHierarchy.parentHierarchyId !== parentHierarchyId
            ) {
                if (existingDataWasteHierarchy.level == 1) {
                    const dataWasteClassification: any =
                        await this.wasteClassificationRepository.findWasteClassificationByCondition(
                            {
                                [Op.or]: [
                                    { waste_group_id: existingDataWasteHierarchy.id },
                                    { waste_type_id: existingDataWasteHierarchy.id },
                                ],
                            },
                        );
                    if (dataWasteClassification) {
                        console.error(
                            `This waste name is already associated with other data. You are only allowed to edit the waste name.`,
                        );
                        throw new Error(
                            `This waste name is already associated with other data. You are only allowed to edit the waste name.`,
                        );
                    }
                } else {
                    const dataWasteClassification: any =
                        await this.wasteClassificationRepository.findWasteClassificationByCondition(
                            {
                                [Op.or]: [
                                    {
                                        waste_group_id:
                                            existingDataWasteHierarchy.parentHierarchyId,
                                    },
                                    {
                                        waste_type_id: existingDataWasteHierarchy.parentHierarchyId,
                                    },
                                ],
                            },
                        );
                    if (dataWasteClassification) {
                        console.error(
                            `This waste name is already associated with other data. You are only allowed to edit the waste name.`,
                        );
                        throw new Error(
                            `This waste name is already associated with other data. You are only allowed to edit the waste name.`,
                        );
                    }
                }
            }

            const getDataOtherThisId: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                    name: name,
                    level: existingDataWasteHierarchy.level,
                    id: {
                        [Op.notIn]: [id],
                    },
                });
            if (getDataOtherThisId?.name === name) {
                console.error(`Waste Hierarchy with Name ${name} already exists`);
                throw new Error(`Waste Hierarchy with Name ${name} already exists`);
            }

            const existingData = await this.wasteHierarchyRepository.getWasteHierarchyById(
                id.toString(),
            );

            if (!existingData) {
                return null;
            }

            if (existingData.level == 1 || existingData.level == 2) {
                if (data.parentHierarchyId === undefined || data.parentHierarchyId === null) {
                    return null;
                }
            }

            const wasteHierarchy: WasteHierarchy = new WasteHierarchy({
                ...existingData,
                name: name ?? existingData.name,
                nameEn: nameEn ?? existingData.nameEn,
                description: description ?? existingData.description,
                descriptionEn: descriptionEn ?? existingData.descriptionEn,
                parentHierarchyId: parentHierarchyId ?? existingData.parentHierarchyId,
                updatedBy: updatedBy,
                updatedAt: new Date(),
                level: existingData.level,
                isResidue: isResidue ?? existingData.isResidue,
                isActive: isActive ?? existingData.isActive,
            });
            await this.wasteHierarchyRepository.updateWasteHierarchy(wasteHierarchy);
            const dataWasteHierarchy = await this.wasteHierarchyRepository.getWasteHierarchyById(
                id.toString(),
            );
            console.log('Waste hierarchy updated successfully(execute):', dataWasteHierarchy);
            return dataWasteHierarchy;
        } catch (error) {
            console.error('Error updating waste hierarchy:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
