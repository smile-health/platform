import WasteClassificationModel from '../../infrastructure/database/models/WasteClassificationModel';

function toPlainClassification(classification: WasteClassificationModel): any {
    // WasteClassificationModel declares its attributes (and wasteType/wasteGroup/
    // wasteCharacteristics) as TS class fields, which shadows Sequelize's attribute
    // getters when read directly off the instance. Reading via .get({ plain: true })
    // bypasses the shadowing and returns the real values.
    return classification.get({ plain: true });
}

export function buildBagWasteClassification(classification?: WasteClassificationModel | null) {
    if (!classification) return undefined;
    const c = toPlainClassification(classification);
    return {
        id: c.id,
        regionId: c.regionId,
        wasteCode: c.wasteCode,
        wasteBagColorCode: c.wasteBagColorCode,
        allowHealthcareFacilityTreatment: c.allowHealthcareFacilityTreatment,
        isActive: c.isActive,
        hasMultipleTransporters: c.hasMultipleTransporters,
        storageRuleType: c.storageRuleType,
        useColdStorage: c.useColdStorage,
        coldStorageMinHours: c.coldStorageMinHours,
        coldStorageMaxHours: c.coldStorageMaxHours,
        tempStorageMinHours: c.tempStorageMinHours,
        tempStorageMaxHours: c.tempStorageMaxHours,
        storageRule: c.storageRule,
        wasteCharacteristics: c.wasteCharacteristics
            ? {
                  id: c.wasteCharacteristics.id,
                  name: c.wasteCharacteristics.name,
                  isActive: c.wasteCharacteristics.isActive,
                  nameEn: c.wasteCharacteristics.nameEn,
              }
            : undefined,
    };
}

export function buildGroupWasteClassificationSummary(
    classifications: Array<WasteClassificationModel | undefined | null>,
) {
    const valid = classifications.filter(Boolean).map((c) => toPlainClassification(c as WasteClassificationModel));
    const first = valid[0];
    const wasteType = first?.wasteType
        ? { id: first.wasteType.id, name: first.wasteType.name, nameEn: first.wasteType.nameEn }
        : undefined;
    const wasteGroup = first?.wasteGroup
        ? { id: first.wasteGroup.id, name: first.wasteGroup.name, nameEn: first.wasteGroup.nameEn }
        : undefined;
    const seen = new Set<number>();
    const wasteCharacteristics = valid
        .map((c) => c.wasteCharacteristics)
        .filter((wc) => wc && !seen.has(wc.id) && seen.add(wc.id))
        .map((wc) => ({ id: wc.id, name: wc.name, isActive: wc.isActive, nameEn: wc.nameEn }));
    return { wasteType, wasteGroup, wasteCharacteristics };
}
