import DisposalRepository from '../../../domain/repositories/DisposalRepository';

export default class GetDisposalUseCase {
    constructor(private readonly repo: DisposalRepository) {}

    async execute(bastNo: string, token: string): Promise<any> {
        try {
            const data = await this.repo.getDisposal(bastNo, token);
            if (!data) {
                console.error(`Disposal with bastNo ${bastNo} not found`);
                return null;
            }
            console.log('Disposal retrieved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving Disposal:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
