import SpeedHandoverRepository from '../../../domain/repositories/SpeedHandoverRepository';
import { HandoverSpeedTransportDTO } from '../../dtos/HandoverSpeedTransportDTO';

export interface HandoverSpeedTransportResponse {
    kode_kantong_limbah: string[];
    status_limbah: 'IN_TRANSIT';
}

export default class HandoverSpeedTransportWaste {
    constructor(private readonly repo: SpeedHandoverRepository) {}

    async execute(data: HandoverSpeedTransportDTO): Promise<HandoverSpeedTransportResponse | string> {
        try {
            const result = await this.repo.handoverToTransporter({
                groupCodes: data.groupCodes,
                entityId: data.entityId,
                nib: data.nib,
                vehicleNumber: data.vehicleNumber,
                transporterOperatorId: data.transporterOperatorId,
                manifestDocNumber: data.manifestDocNumber,
                manifestFile: data.manifestFile,
                latitude: data.latitude,
                longitude: data.longitude,
                handoverTimestamp: data.handoverTimestamp,
                startTime: data.startTime,
                isReadOnly: data.isReadOnly,
                transporterId: data.transporterId,
                transporterUpdatedBy: data.transporterUpdatedBy,
            });

            if (typeof result === 'string') return result;

            return { kode_kantong_limbah: result, status_limbah: 'IN_TRANSIT' };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
