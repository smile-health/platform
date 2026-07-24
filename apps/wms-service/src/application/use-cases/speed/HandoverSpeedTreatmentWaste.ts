import SpeedHandoverRepository from '../../../domain/repositories/SpeedHandoverRepository';
import { HandoverSpeedTreatmentDTO } from '../../dtos/HandoverSpeedTreatmentDTO';

export interface HandoverSpeedTreatmentResponse {
    kode_kantong_limbah: string[];
    status_limbah: 'HANDOVER_TO_TREATMENT';
}

export default class HandoverSpeedTreatmentWaste {
    constructor(private readonly repo: SpeedHandoverRepository) {}

    async execute(data: HandoverSpeedTreatmentDTO): Promise<HandoverSpeedTreatmentResponse | string> {
        try {
            const result = await this.repo.handoverToTreatment({
                groupCodes: data.groupCodes,
                thirdPartyId: data.thirdPartyId,
                nib: data.nib,
                treatmentLocationId: data.treatmentLocationId,
                transporterOperatorId: data.transporterOperatorId,
                startTime: data.startTime,
                endTime: data.endTime,
                updatedBy: data.updatedBy,
            });

            if (typeof result === 'string') return result;

            return { kode_kantong_limbah: result, status_limbah: 'HANDOVER_TO_TREATMENT' };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
