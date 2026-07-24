import WasteTreatmentExternalGroupRepository from '../../../domain/repositories/WasteTreatmentExternalGroupRepository';
import WasteTreatmentExternalGroup from '../../../domain/entities/WasteTreatmentExternalGroup';

export default class GetWasteTreatmentExternalGroupUseCase {
  constructor(private readonly wasteSourceRepository: WasteTreatmentExternalGroupRepository) {}

  async execute(
    token: string,
    id?: number,
    qrCodeId?: string,
  ): Promise<WasteTreatmentExternalGroup | null> {
    try {
      const wasteSource =
        await this.wasteSourceRepository.getWasteTreatmentExternalGroupByIdWithWasteBags(
          token,
          id,
          qrCodeId,
        );
      return wasteSource;
    } catch (error) {
      console.error('Error fetching waste source:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
