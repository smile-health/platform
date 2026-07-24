import DisposalRepository from '../../../domain/repositories/DisposalRepository';

export default class ConfirmDisposalUseCase {
    constructor(private readonly repo: DisposalRepository) {}

    async execute(
        bastNo: string,
        status: 'APPROVED' | 'REJECTED',
        userUuid: string,
        token: string,
        reason?: string,
    ): Promise<boolean> {
        try {
            const result = await this.repo.approvalDisposal(
                bastNo,
                status,
                userUuid,
                token,
                reason,
            );

            return result;
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
