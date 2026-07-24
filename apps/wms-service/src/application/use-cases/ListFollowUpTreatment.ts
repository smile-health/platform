import WasteBagRepository from '../../domain/repositories/WasteBagRepository';
import { WasteStatusUpdateService } from '../../domain/services/WasteStatusUpdateService';
import StoreWasteDTO from '../dtos/StoreWasteDTO';

export default class ListFollowUpTreatmentUseCase {
    constructor(private readonly wasteBagRepository: WasteBagRepository) {}

    async execute(data: StoreWasteDTO): Promise<{ label: string; value: string }[]> {
        try {
            const { wasteBagQrCodeIds, entity: {id} } = data;

            const listTreatment = await this.wasteBagRepository.getListTreatment(wasteBagQrCodeIds, id);

            return listTreatment;
        } catch (error) {
            console.error('Error get data:', error);
            throw new Error(error?.toString());
        }
    }
}
