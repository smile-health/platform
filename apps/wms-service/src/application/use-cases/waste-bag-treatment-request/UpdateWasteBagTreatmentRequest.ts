import WasteBagTreatmentRequest from '../../../domain/entities/WasteBagTreatmentRequest';
import WasteBagTreatmentRequestRepository from '../../../domain/repositories/WasteBagTreatmentRequestRepository';
import UpdateWasteBagTreatmentRequestDTO from '../../dtos/UpdateWasteBagTreatmentRequestDTO';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { WasteBagTreatmentGroupModel } from '../../../infrastructure/database/models/WasteBagTreatmentGroupModel';
export default class UpdateWasteBagTreatmentRequestUseCase {
    constructor(
        private readonly wasteBagTreatmentRequestRepository: WasteBagTreatmentRequestRepository,
    ) {}

    async execute(
        data: UpdateWasteBagTreatmentRequestDTO,
    ): Promise<WasteBagTreatmentRequest | null | string> {
        try {
            const {
                id,
                updatedBy,
                requestStatus,
                treatmentGroupId,
                requestApproverId,
                requestCreatorId,
            } = data;

            const existingData =
                await this.wasteBagTreatmentRequestRepository.getWasteBagTreatmentRequestById(
                    id.toString(),
                );

            if (!existingData) {
                return null;
            }

            const existingDataRelational = (await checkExistingData(
                WasteBagTreatmentGroupModel,
                treatmentGroupId,
            )) as any;

            if (!existingDataRelational) {
                return `Waste bag treatment group with ID ${treatmentGroupId} not found`;
            }

            const wasteBagTreatmentRequest: WasteBagTreatmentRequest = new WasteBagTreatmentRequest(
                {
                    ...existingData,
                    createdAt: new Date(),
                    updatedBy: updatedBy,
                    requestStatus,
                    treatmentGroupId,
                    requestApproverId,
                    requestCreatorId,
                },
            );

            await this.wasteBagTreatmentRequestRepository.updateWasteBagTreatmentRequest(
                wasteBagTreatmentRequest,
            );
            console.log(
                'Waste Bag Qr Code updated successfully(execute):',
                wasteBagTreatmentRequest,
            );
            return wasteBagTreatmentRequest;
        } catch (error) {
            console.error('Error creating Waste Bag Qr Code:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
