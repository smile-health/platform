// Mirrors apps/wms-service's interfaces/http/controllers/mobile/scanQrCodeController.ts
// (scanQrCode), mounted at v1RouterMobile.use('/scan-qr-code', scanQrRoutes)
// under app.use('/api/v1/mobile', ...).
//
//   GET /api/v1/mobile/scan-qr-code/:id   scanQrCode
//
// DEFERRED (documented, not implemented):
//   - `scale_asset_ids`: the original populates this from either
//     GetActiveHealthcareWasteScaleAssetsUseCase (a third-party
//     asset-inventory HTTP call gated by process.env.IS_ASSET_NEW) or
//     GetHealthcareFacilityAssetModel.executeAll (HealthcareFacilityAssetImpl,
//     itself another cross-service HTTP call). Neither of those use-cases nor
//     the third-party asset-inventory HTTP client
//     (getAssetInventories/getAssetInventoriesById in
//     infrastructure/external-apis/thirdPartyClient.ts) has been ported into
//     wms-encore yet — apps/wms-encore/asset/healthcare-asset only covers
//     create/get/update, not this "active waste scale assets" query. Returned
//     as an empty array here, same convention as every other not-yet-wired
//     cross-service lookup in this migration.
//   - accept-language driven id/en label switching is preserved (isID flag).

import type { Header } from "encore.dev/api";

export interface ScanQrCodeRequest {
  id: string;
  acceptLanguage?: Header<"Accept-Language">;
}

export interface WasteBagDetailsView {
  waste_code: string;
  source_type?: string;
  waste_source_id?: number;
  waste_source: string;
  waste_type?: string;
  waste_type_en?: string;
  waste_group?: string;
  waste_group_en?: string;
  waste_characteristic?: string;
  waste_characteristic_en?: string;
  waste_classification_id?: number;
  cold_storage_max_time: string;
  temp_storage_max_time: string;
  scheduledStorageEndDatetime?: Date;
  minimunDecayDay: string;
  is_treated: boolean;
  created_at?: Date;
}

export interface ScanQrCodeResponse {
  status: "success";
  data: {
    waste_bag_details: WasteBagDetailsView;
    // Deferred — see file header.
    scale_asset_ids: { id: number; name: string }[];
  };
}
