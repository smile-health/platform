import WasteBagTreatmentRequest from '../../../domain/entities/WasteBagTreatmentRequest';
import WasteBagTreatmentRequestRepository from '../../../domain/repositories/WasteBagTreatmentRequestRepository';
import CreateWasteBagTreatmentRequestDTO from '../../dtos/CreateWasteBagTreatmentRequestDTO';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import { WasteBagTreatmentGroupModel } from '../../../infrastructure/database/models/WasteBagTreatmentGroupModel';

export default class CreateWasteBagTreatmentRequestUseCase {
    constructor(
        private readonly wasteBagTreatmentRequestRepository: WasteBagTreatmentRequestRepository,
    ) {}

    async execute(
        data: CreateWasteBagTreatmentRequestDTO,
    ): Promise<WasteBagTreatmentRequest | string> {
        try {
            const {
                createdBy,
                requestStatus,
                treatmentGroupId,
                requestApproverId,
                requestCreatorId,
            } = data;

            const wasteBagTreatmentRequest: WasteBagTreatmentRequest = new WasteBagTreatmentRequest(
                {
                    createdAt: new Date(),
                    createdBy,
                    requestStatus,
                    treatmentGroupId,
                    requestApproverId,
                    requestCreatorId,
                },
            );

            const existingDataRelational = (await checkExistingData(
                WasteBagTreatmentGroupModel,
                treatmentGroupId,
            )) as any;

            if (!existingDataRelational) {
                return `Waste bag treatment group with ID ${treatmentGroupId} not found`;
            }

            await this.wasteBagTreatmentRequestRepository.createWasteBagTreatmentRequest(
                wasteBagTreatmentRequest,
            );
            console.log(
                'Waste Bag Treatment Request created successfully(execute):',
                wasteBagTreatmentRequest,
            );
            return wasteBagTreatmentRequest;
        } catch (error) {
            console.error('Error creating Waste Bag Treatment Request:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
