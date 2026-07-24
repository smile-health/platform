import { Request, Response } from 'express';
import WasteBagQrCodeRepositoryImpl from '../../../../infrastructure/database/repositories/WasteBagQrCodeRepoitoryImpl';
import GetWasteBagQrCodeUseCase from '../../../../application/use-cases/waste-bag-qr-code/GetWasteBagQrCode';
import { getWasteSourceName } from '../../../../shared/utils/formating';
import HealthcareFacilityAssetImpl from '../../../../infrastructure/database/repositories/HealthcareFacilityAssetImpl';
import GetHealthcareFacilityAssetModel from '../../../../application/use-cases/healthcare-facility-asset/GetHealthcareFacilityAsset';
import HealthcareFacilityAsset from '../../../../domain/entities/HealthcareFacilityAsset';
import GetActiveHealthcareWasteScaleAssetsUseCase from '../../../../application/use-cases/healthcare-asset/GetActiveHealthcareWasteScaleAssets';
import HealthcareAssetImpl from '../../../../infrastructure/database/repositories/HealthcareAssetImpl';
import HealthcareAsset from '../../../../domain/entities/HealthcareAsset';

export async function scanQrCode(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const entityId = req.user?.entity?.id;
    if (!entityId) {
      res.fail('entityId is required');
      return;
    }

    const {
      // limit,
      page,
      search,
      healthcareFacilityId,
      // assetType,
      manufacturerId,
      isIotEnable,
      assetStatus,
    } = req.query;

    const repo = new WasteBagQrCodeRepositoryImpl();
    const useCase = new GetWasteBagQrCodeUseCase(repo);

    const repoAssetHf = new HealthcareFacilityAssetImpl();
    const useCaseAssetHf = new GetHealthcareFacilityAssetModel(repoAssetHf);

    const repoHealthcareAsset = new HealthcareAssetImpl();
    const useCaseHealthcareAsset = new GetActiveHealthcareWasteScaleAssetsUseCase(
      repoHealthcareAsset,
    );

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];
    const healthcareScaleAssets = await useCaseHealthcareAsset.execute(entityId, token);

    const hfScaleAssets = await useCaseAssetHf.executeAll(
      100,
      Number(page?.toString()),
      token.toString(),
      search?.toString(),
      req.user?.entity.id,
      'SCALE',
      Number(manufacturerId?.toString()),
      Number(isIotEnable?.toString()),
      assetStatus?.toString(),
    );

    const data = await useCase.execute(id, entityId);

    if (data === null) {
      res.fail(req.t('waste-bag-qrcode.error.NOT_FOUND'));
      return;
    } else if (typeof data === 'string') {
      res.fail(req.t(`waste-bag-qrcode.error.${data}`), { isValidationError: true });
      return;
    }

    const isTreated = data.wasteSource?.sourceType === 'INTERNAL_TREATMENT';

    const acceptLang = req.headers['accept-language'];
    const isID = acceptLang?.toLowerCase() === 'id';

    res.success({
      waste_bag_details: {
        waste_code: data.qrCode,
        source_type: data.wasteSource?.sourceType,
        waste_source_id: data.wasteSource?.id,
        waste_source: getWasteSourceName(data.wasteSource),
        waste_type: isID
          ? data.wasteClassification?.wasteType.name
          : data.wasteClassification?.wasteType.nameEn,
        waste_type_en: data.wasteClassification?.wasteType.nameEn,
        waste_group: isID
          ? data.wasteClassification?.wasteGroup.name
          : data.wasteClassification?.wasteGroup.nameEn,
        waste_group_en: data.wasteClassification?.wasteGroup.nameEn,
        waste_characteristic: isID
          ? data.wasteClassification?.wasteCharacteristics.name
          : data.wasteClassification?.wasteCharacteristics.nameEn,
        waste_characteristic_en: data.wasteClassification?.wasteCharacteristics.nameEn,
        waste_classification_id: data.wasteClassification?.id,
        cold_storage_max_time: data.wasteClassification?.coldStorageMaxHours + ' Hours',
        temp_storage_max_time: data.wasteClassification?.tempStorageMaxHours + ' Hours',
        scheduledStorageEndDatetime: data.scheduledStorageEndDatetime,
        minimunDecayDay: data.wasteClassification?.minimunDecayDay + ' Days',
        is_treated: isTreated,
        created_at: data.createdAt,
      },
      scale_asset_ids:
        process.env.IS_ASSET_NEW === 'true'
          ? (healthcareScaleAssets ?? []).map((asset: any) => ({
              id: asset.id,
              name: asset.assetId,
            }))
          : (hfScaleAssets?.data ?? []).map((asset: any) => ({
              id: asset.id,
              name: asset.assetId,
            })),
    });
  } catch (error) {
    console.error('Error in get detail data dashboard:', error);
    res.error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
