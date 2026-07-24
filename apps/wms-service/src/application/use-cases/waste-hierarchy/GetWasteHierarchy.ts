import WasteHierarchy from '../../../domain/entities/WasteHierarchy';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';

export default class GetWasteHierarchyUseCase {
    constructor(private readonly wasteHierarchyRepository: WasteHierarchyRepository) {}

    async execute(id: string): Promise<WasteHierarchy | null> {
        try {
            if (!id) {
                throw new Error('ID parameter is required');
            }
            const wasteHierarchy = await this.wasteHierarchyRepository.getWasteHierarchyById(id);
            console.log('Waste hierarchy retrieved successfully:', wasteHierarchy);
            return wasteHierarchy;
        } catch (error) {
            console.error('Error retrieving waste hierarchy:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async executeByParentHierarchyId(parentHierarchyId: string): Promise<WasteHierarchy[] | null> {
        try {
            if (parentHierarchyId == 'null') {
                const wasteHierarchy =
                    await this.wasteHierarchyRepository.getWasteHierarchyByParentHierarchyIdNull();
                console.log('Waste hierarchy retrieved successfully:', wasteHierarchy);
                return wasteHierarchy;
            } else {
                const wasteHierarchy =
                    await this.wasteHierarchyRepository.getWasteHierarchyByParentHierarchyId(
                        parentHierarchyId,
                    );

                console.log('Waste hierarchy retrieved successfully:', wasteHierarchy);
                return wasteHierarchy;
            }
        } catch (error) {
            console.error('Error retrieving waste hierarchy:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }

    async executeAll(
        limit: number,
        page: number,
        token: string,
        search?: string,
        level?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        isActive?: number,
    ): Promise<{
        data: WasteHierarchy[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteHierarchy = await this.wasteHierarchyRepository.getAllWasteHierarchy(
                limit,
                page,
                token,
                search,
                level,
                wasteTypeId,
                wasteGroupId,
                isActive,
            );
            console.log('Fetched all waste sources successfully:', wasteHierarchy);
            return wasteHierarchy;
        } catch (error) {
            console.error('Error fetching all waste hierarchy:', error);
            throw new Error('Error fetching all waste hierarchy');
        }
    }
}
