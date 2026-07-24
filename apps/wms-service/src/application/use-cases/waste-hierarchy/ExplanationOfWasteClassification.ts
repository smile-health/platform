import DashboardWasteHierarchy from '../../../domain/entities/Dashboard';
import WasteHierarchyRepository from '../../../domain/repositories/WasteHierarchyRepository';

export default class ExplanationOfWasteClassificationUseCase {
    constructor(private readonly wasteHierarchyRepository: WasteHierarchyRepository) {}

    async execute(): Promise<DashboardWasteHierarchy[]> {
        try {
            const wasteHierarchy =
                await this.wasteHierarchyRepository.explanationOfWasteClassification();
            console.log('explanationOfWasteClassification retrieved successfully:', wasteHierarchy);
            return wasteHierarchy;
        } catch (error) {
            console.error('Error retrieving explanationOfWasteClassification:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
