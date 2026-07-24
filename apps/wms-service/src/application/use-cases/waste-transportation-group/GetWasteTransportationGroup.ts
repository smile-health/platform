import WasteTransportationGroup from '../../../domain/entities/WasteTransportationGroup';
import WasteTransportationGroupRepository from '../../../domain/repositories/WasteTransportationGroupRepository';

export default class GetWasteTransportationGroupUseCase {
    constructor(private readonly wasteTransportationGroup: WasteTransportationGroupRepository) {}

    async execute(
        token: string,
        id?: string,
        qrCodeId?: string,
    ): Promise<WasteTransportationGroup | null> {
        try {
            const wasteSource = await this.wasteTransportationGroup.getWasteTransportationGroupById(
                token,
                id,
                qrCodeId,
            );
            console.log('Fetched waste source successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
