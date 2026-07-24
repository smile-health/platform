import WasteBagQrCode from '../../../domain/entities/WasteBagQrCode';
import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';
import CreateWasteBagQrCodeDTO from '../../dtos/CreateWasteBagQrCodeDTO';
import { getExistingIds } from '../../../shared/utils/checkExistingData';
import WasteClassificationModel from '../../../infrastructure/database/models/WasteClassificationModel';
import { WasteSourceModel } from '../../../infrastructure/database/models/WasteSourceModel';

export default class CreateWasteBagQrCodeUseCase {
  constructor(private readonly wasteBagQrCodeRepository: WasteBagQrCodeRepository) {}

  async execute(
    dataList: CreateWasteBagQrCodeDTO[],
    createdById: string,
  ): Promise<string | WasteBagQrCode[]> {
    try {
      const returnDataId: number[] = [];
      const now = new Date();

      const wasteSourceIds = dataList.map((data) => data.wasteSourceId.toString());
      const classificationIds = dataList.map((data) => data.wasteClassificationId);
      const [existingWasteSourceIds, existingClassificationIds] = await Promise.all([
        getExistingIds(WasteSourceModel, wasteSourceIds),
        getExistingIds(WasteClassificationModel, classificationIds),
      ]);

      for (const data of dataList) {
        const { healthcareFacilityId, wasteSourceId, wasteClassificationId, labelCount } = data;

        if (!existingWasteSourceIds.has(wasteSourceId.toString())) {
          return 'NOT_FOUND_WS';
        }

        if (!existingClassificationIds.has(wasteClassificationId.toString())) {
          return 'NOT_FOUND_CLASSIFICATION';
        }

        // Prepare insert promises
        const insertPromises = Array.from({ length: labelCount }, async () => {
          const wasteBag = new WasteBagQrCode({
            createdAt: now,
            createdBy: createdById,
            healthcareFacilityId,
            wasteSourceId,
            wasteClassificationId,
            qrCode: '',
          });

          return this.wasteBagQrCodeRepository.createWasteBagQrCode(wasteBag);
        });

        // Execute inserts in parallel
        const returnPromises = await Promise.all(insertPromises);
        returnDataId.push(...returnPromises);
      }

      return (await this.wasteBagQrCodeRepository.getWasteBagQrCodeAfterCreateByIds(
        returnDataId,
      )) as WasteBagQrCode[];
    } catch (error) {
      console.error('Error creating Waste Bag Qr Code:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
