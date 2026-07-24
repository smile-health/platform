import SpeedHandoverRepository from '../../../domain/repositories/SpeedHandoverRepository';
import { GetSpeedTransportGroupByCodeDTO } from '../../dtos/GetSpeedTransportGroupByCodeDTO';
import {
    mapTransportGroupToSpeedResponse,
    SpeedGrupPengangkutanResponse,
} from './mapTransportGroupToSpeedResponse';

export default class GetSpeedTransportGroupByCode {
    constructor(private readonly repo: SpeedHandoverRepository) {}

    async execute(data: GetSpeedTransportGroupByCodeDTO): Promise<SpeedGrupPengangkutanResponse | null> {
        try {
            const group = await this.repo.getTransportGroupByCode(data.groupCode);
            if (!group) return null;
            return mapTransportGroupToSpeedResponse(group, true);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
