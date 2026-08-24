// Mirrors apps/wms-service's interfaces/http/controllers/mobile/enterWeightController.ts
// (createWasteController) + request-schemas/enterWeight.schema.ts, mounted at
// v1RouterMobile.use('/enter-weight', enterWeightRoutes) under
// app.use('/api/v1/mobile', ...).
//
//   POST /api/v1/mobile/enter-weight   createWasteController
//
// This is a thin field-mapping shim in front of the already-ported
// waste-bag module's createWasteBag (apps/wms-encore/waste/waste-bag) — the
// mobile app's wire shape (weight/qrCode/scaleMethod enum
// internet|bluetooth|manual/sourceTreatmentGroupIds) differs from the
// canonical CreateWasteBagRequest shape (weightInKgs/wasteBagQrCodeId/
// scaleMethod MANUAL|IOT+iotMethod/wasteGroupIds), same mapping the original
// controller performs inline before calling CreateWasteUseCase. All of the
// real business logic (wasteClassification lookup, radioactive
// re-registration branch, status-change publish) lives in
// waste-bag.service.ts's createWasteBag and is not duplicated here.
//
// DEFERRED: missing-bearer-token branch — structurally unreachable under
// auth:true, same as waste-bag.service.ts's createWasteBag doc comment notes.
// healthcareFacilityId is NOT read from the body (the original always
// overrides it with req.user.entity.id) — omitted from this request type for
// the same reason update-waste-bag-qr-code omits it.

export interface EnterWeightRequest {
  wasteSourceId: number;
  wasteClassificationId: number;
  scaleMethod: "internet" | "bluetooth" | "manual";
  weight: number;
  sourceTreatmentGroupId?: string;
  qrCode: string;
  binNumber?: string;
  wasteGroupIds?: string;
  sourceTreatmentGroupIds?: string;
  isTreated?: boolean;
  isRadioActive?: boolean;
  assetId?: number;
  bastNo?: string;
  materialIds?: string;
}

import type { WasteBag } from "../waste-bag/waste-bag.types";

export interface EnterWeightResponse {
  status: "success";
  data: WasteBag;
}
