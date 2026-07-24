import WasteTransportExternalGroupRepository from '../../../domain/repositories/WasteTransportExternalGroupRepository';
import WasteTransportationExternalGroup from '../../../domain/entities/WasteTransportationExternalGroup';
import WasteBagTransportationExternalGroupImpl from '../../../infrastructure/database/repositories/WasteBagTransportExternalGroupImpl';

export default class GetWasteTransportExternalGroupUseCase {
  constructor(private readonly wasteSourceRepository: WasteBagTransportationExternalGroupImpl) {}

  async execute(
    token: string,
    id?: number,
    qrCodeId?: string,
  ): Promise<WasteTransportationExternalGroup | null> {
    try {
      const wasteSource =
        await this.wasteSourceRepository.getWasteTransportExternalGroupByIdWithWasteBags(
          token,
          id,
          qrCodeId,
        );
      // console.log('Fetched waste source successfully:', wasteSource);
      return wasteSource;
    } catch (error) {
      console.error('Error fetching waste source:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
