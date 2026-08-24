import * as wasteBagService from "../waste-bag/waste-bag.service";
import type { WasteBag } from "../waste-bag/waste-bag.types";
import type { EnterWeightRequest } from "./mobile-enter-weight.types";

export async function createWaste(
  req: EnterWeightRequest,
  auth: { entityId: number; userID: string }
): Promise<WasteBag> {
  // Mirrors enterWeightController.ts's inline mapping verbatim.
  const scaleMethod = req.scaleMethod === "manual" ? "MANUAL" : "IOT";
  const iotMethod =
    req.scaleMethod === "internet" ? "INTERNET" : req.scaleMethod === "bluetooth" ? "BLUETOOTH" : undefined;

  return wasteBagService.createWasteBag({
    healthcareFacilityId: auth.entityId,
    createdBy: auth.userID,
    wasteSourceId: req.wasteSourceId,
    wasteClassificationId: req.wasteClassificationId,
    sourceTreatmentGroupId: req.sourceTreatmentGroupId,
    scaleMethod,
    iotMethod: scaleMethod === "IOT" ? iotMethod : undefined,
    weightInKgs: req.weight,
    wasteBagQrCodeId: req.qrCode,
    assetId: req.assetId,
    binNumber: req.binNumber,
    wasteGroupIds: req.sourceTreatmentGroupIds ?? req.wasteGroupIds,
    bastNo: req.bastNo,
    materialIds: req.materialIds,
    isTreated: req.isTreated,
    isRadioActive: req.isRadioActive === true,
  });
}
