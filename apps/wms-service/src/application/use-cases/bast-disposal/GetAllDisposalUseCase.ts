import DisposalRepository from '../../../domain/repositories/DisposalRepository';
import DisposalModel from '../../../infrastructure/database/models/DisposalModel';

export default class GetAllDisposalUseCase {
    constructor(private readonly repo: DisposalRepository) {}
    async execute(
        limit: number,
        page: number,
        entityId: number | undefined,
        search?: string,
        status?: string,
        isRead?: boolean,
    ): Promise<{
        data: any[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            console.log(entityId);
            const data = await this.repo.getAlldisposalByEntityId(
                limit,
                page,
                entityId,
                search,
                status,
                isRead,
            );
            console.log('Fetched data successfully:', data);
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw new Error('Error fetching data');
        }
    }
}
