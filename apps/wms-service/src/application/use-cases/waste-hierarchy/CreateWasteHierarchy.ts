import WasteHierarchy from '../../../domain/entities/WasteHierarchy';
import RegionRepository from '../../../domain/repositories/RegionRepository';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';
import CreateWasteHierarchyDTO from '../../dtos/CreateWasteHierarchyDTO';

export default class CreateWasteHierarchyUseCase {
    constructor(
        private readonly wasteHierarchyRepository: WasteHierarchyRepository,
        private readonly regionRepository: RegionRepository,
    ) {}

    async execute(data: CreateWasteHierarchyDTO): Promise<WasteHierarchy> {
        try {
            let {
                createdBy,
                name,
                nameEn,
                description,
                descriptionEn,
                parentHierarchyId,
                regionId,
                level,
                isResidue,
            } = data;

            let existingDataRegion: any = await this.regionRepository.getOneRegion();
            if (!existingDataRegion) {
                console.error(`Region not found`);
                throw new Error('Region not found');
            }

            let existingDataHierarchy: any =
                await this.wasteHierarchyRepository.findWasteHierarchyByCondition({ name: name });
            if (parentHierarchyId !== undefined) {
                existingDataHierarchy =
                    await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                        name: name,
                        parent_hierarchy_id: parentHierarchyId,
                    });
            }

            if (existingDataHierarchy) {
                console.error(`Waste Hierarchy with Name ${name} already exists`);
                throw new Error(`Waste Hierarchy with Name ${name} already exists`);
            }

            if (level == 1 || level == 2) {
                if (parentHierarchyId) {
                    const existingDataParent =
                        await this.wasteHierarchyRepository.findWasteHierarchyByCondition({
                            name: name,
                            parent_hierarchy_id: parentHierarchyId,
                        });
                    if (existingDataParent) {
                        console.error(`Waste Hierarchy with ID ${parentHierarchyId} not found`);
                        throw new Error(`Waste Hierarchy with ID ${parentHierarchyId} not found`);
                    }
                }
            }

            if (!regionId) {
                regionId = existingDataRegion.id;
            }

            const wasteHierarchy: WasteHierarchy = new WasteHierarchy({
                createdAt: new Date(),
                createdBy,
                regionId,
                name,
                nameEn,
                description,
                descriptionEn,
                parentHierarchyId,
                level,
                isResidue,
            });

            await this.wasteHierarchyRepository.createWasteHierarchy(wasteHierarchy);
            console.log('Waste Hierarchy created successfully(execute):', wasteHierarchy);
            return wasteHierarchy;
        } catch (error) {
            console.error('Error creating Hierarchy:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
