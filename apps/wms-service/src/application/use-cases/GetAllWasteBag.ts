import WasteBag from '../../domain/entities/WasteBag';
import WasteBagRepository from '../../domain/repositories/WasteBagRepository';

export default class GetAllWasteBagUseCase {
  constructor(private readonly repo: WasteBagRepository) {}

  async execute(
    limit: number,
    page: number,
    search?: string,
    healthcareId?: number,
    transporterId?: number,
    thirdPartyId?: number,
    wasteUpdateStart?: string,
    wasteUpdateEnd?: string,
    wasteClassificationId?: number[],
    transportationGroupId?: number,
    transportationExternalGroupId?: number,
    treatmentGroupId?: number,
    treatmentExternalGroupId?: number,
    sourceType?: string,
    ownedBy?: string,
    wasteStatus?: string,
    binNumber?: string,
    wasteBagQrCodeId?: string,
    id?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
    isTreated?: boolean,
    isDisposed?: boolean,
    entityTag?: string,
    entityId?: number,
    isLoggerHistory?: boolean,
    isHomePage?: boolean,
  ): Promise<{
    data: WasteBag[];
    pagination: {
      total: number;
      pages: number;
      currentPage: number;
      perPage: number;
    };
  }> {
    try {
      const wasteSources = await this.repo.getAllWasteBag(
        limit,
        page,
        search,
        healthcareId,
        transporterId,
        thirdPartyId,
        wasteUpdateStart,
        wasteUpdateEnd,
        wasteClassificationId,
        transportationGroupId,
        transportationExternalGroupId,
        treatmentGroupId,
        treatmentExternalGroupId,
        sourceType,
        ownedBy,
        wasteStatus,
        binNumber,
        wasteBagQrCodeId,
        id,
        wasteTypeId,
        wasteGroupId,
        wasteCharacteristicsId,
        isTreated,
        isDisposed,
        entityTag,
        entityId,
        isHomePage ?? false,
        isLoggerHistory ?? false,
      );

      return wasteSources;
    } catch (error) {
      console.error('Error fetching all waste bag:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
