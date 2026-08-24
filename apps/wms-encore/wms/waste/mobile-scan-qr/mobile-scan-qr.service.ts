import { APIError, ErrCode } from "encore.dev/api";
import * as qrCodeService from "../waste-bag-qr-code/waste-bag-qr-code.service";
import * as wasteClassificationRepo from "../waste-classification/waste-classification.repository";
import * as wasteSourceRepo from "../waste-source/waste-source.repository";
import type { WasteSource } from "../waste-source/waste-source.types";
import type { WasteBagDetailsView } from "./mobile-scan-qr.types";

// Mirrors shared/utils/formating.ts's getWasteSourceName — duplicated locally,
// same rationale as mobile-homepage.service.ts's copy.
function getWasteSourceName(wasteSource: WasteSource | null): string {
  switch (wasteSource?.sourceType) {
    case "EXTERNAL":
      return wasteSource.externalHealthcareFacilityName || "Unknown External Source";
    case "INTERNAL":
      return wasteSource.internalSourceName || "Unknown Internal Source";
    case "INTERNAL_TREATMENT":
      return wasteSource.internalTreatmentName || "Unknown Internal Treatment";
    default:
      return "Unknown Source";
  }
}

export async function scanQrCode(
  id: string,
  entityId: number,
  acceptLanguage: string | undefined
): Promise<{ waste_bag_details: WasteBagDetailsView; scale_asset_ids: { id: number; name: string }[] }> {
  if (!id) {
    throw new APIError(ErrCode.FailedPrecondition, "ID parameter is required");
  }
  if (!entityId) {
    throw new APIError(ErrCode.FailedPrecondition, "entityId is required");
  }

  // getWasteBagQrCodeById already reproduces the original's
  // NOT_FOUND/ALREADY_REGISTERED/RADIOACTIVE_STILL_IN_STORAGE branches (see
  // waste-bag-qr-code.service.ts) — no need to duplicate that logic here.
  const data = await qrCodeService.getWasteBagQrCodeById(id, entityId);

  const [wasteClassification, wasteSource] = await Promise.all([
    data.wasteClassificationId ? wasteClassificationRepo.findById(data.wasteClassificationId) : null,
    data.wasteSourceId ? wasteSourceRepo.findById(data.wasteSourceId) : null,
  ]);

  const isTreated = wasteSource?.sourceType === "INTERNAL_TREATMENT";
  const isID = acceptLanguage?.toLowerCase() === "id";

  const waste_bag_details: WasteBagDetailsView = {
    waste_code: data.qrCode,
    source_type: wasteSource?.sourceType,
    waste_source_id: wasteSource?.id,
    waste_source: getWasteSourceName(wasteSource),
    waste_type: isID ? wasteClassification?.wasteType?.name : wasteClassification?.wasteType?.nameEn,
    waste_type_en: wasteClassification?.wasteType?.nameEn,
    waste_group: isID ? wasteClassification?.wasteGroup?.name : wasteClassification?.wasteGroup?.nameEn,
    waste_group_en: wasteClassification?.wasteGroup?.nameEn,
    waste_characteristic: isID
      ? wasteClassification?.wasteCharacteristics?.name
      : wasteClassification?.wasteCharacteristics?.nameEn,
    waste_characteristic_en: wasteClassification?.wasteCharacteristics?.nameEn,
    waste_classification_id: wasteClassification?.id,
    cold_storage_max_time: `${wasteClassification?.coldStorageMaxHours ?? ""} Hours`,
    temp_storage_max_time: `${wasteClassification?.tempStorageMaxHours ?? ""} Hours`,
    scheduledStorageEndDatetime: data.scheduledStorageEndDatetime,
    minimunDecayDay: `${wasteClassification?.minimunDecayDay ?? ""} Days`,
    is_treated: isTreated,
    created_at: data.createdAt,
  };

  return {
    waste_bag_details,
    // Deferred — see mobile-scan-qr.types.ts header.
    scale_asset_ids: [],
  };
}
