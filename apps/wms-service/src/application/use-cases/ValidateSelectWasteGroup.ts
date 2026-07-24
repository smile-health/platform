import WasteBagRepository from '../../domain/repositories/WasteBagRepository';

export default class ValidateWasteBagGroupUseCase {
    constructor(private readonly wasteBagRepository: WasteBagRepository) {}
    async execute(): Promise<boolean> {
        try {
            return true;
        } catch (error) {
            return false;
        }
    }
}
