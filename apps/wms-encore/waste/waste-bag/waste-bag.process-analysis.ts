// Ports apps/wms-service's src/shared/utils/countProsessEvent.ts
// (handleAnalisisProcessCount) verbatim. Used to compute the WasteBag
// response's `processWastebagEnd` field — the ordered list of
// wasteStatus milestones a bag is expected to pass through given its
// waste_classification's disposalMethod/treatmentMethod, whether it's
// already treated, and whether it belongs to a group (wasteGroupIds).
// Pure/derived — no DB access, so it's ported as-is rather than adapted.
export function handleAnalisisProcessCount(
  disposal?: string,
  treatment?: string | null,
  isTreated?: boolean,
  groupsIds?: string,
  _status?: string
): string[] | undefined {
  const hasTreatment = !!treatment && treatment.trim() !== "";
  const disposalSet = new Set(disposal ? disposal.split(",").map((d) => d.trim()) : []);
  const treatmentSet = new Set(treatment ? treatment.split(",").map((d) => d.trim()) : []);

  if (!isTreated && treatmentSet.has("INTERNAL_LANDFILL") && treatmentSet.has("PYROLYSIS")) {
    return ["IN_TEMPORARY_STORAGE", "INCINERATED", "INTERNAL_LANDFILLED"];
  }

  if (!isTreated && treatmentSet.has("INTERNAL_LANDFILL") && !treatmentSet.has("PYROLYSIS")) {
    return ["IN_TEMPORARY_STORAGE", "INTERNAL_LANDFILLED"];
  }

  if (!hasTreatment && disposalSet.has("SPECIALIZED_TREATMENT_PROVIDER")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "COLLECTED"];
  }

  if (!hasTreatment && disposalSet.has("TRANSPORTER_GOVERNMENT")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "DISPOSED"];
  }

  if (!hasTreatment && disposalSet.has("TRANSPORTER_GOVERNMENT_WASTE_BANK")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "DISPOSED"];
  }

  if (hasTreatment && (disposalSet.has("TRANSPORTER_RECYCLER") || disposalSet.has("TRANSPORTER_LANDFILL"))) {
    if (treatmentSet.has("DISINFECTION") && disposalSet.has("TRANSPORTER_RECYCLER")) {
      return ["IN_TEMPORARY_STORAGE", "STERILISED", "IN_TRANSIT", "RECYCLED"];
    }

    if (
      treatmentSet.has("PYROLYSIS") &&
      disposalSet.has("TRANSPORTER_LANDFILL") &&
      isTreated &&
      groupsIds &&
      groupsIds.length > 0
    ) {
      return ["IN_TEMPORARY_STORAGE", "INCINERATED", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
    }

    if (
      treatmentSet.has("PYROLYSIS") &&
      disposalSet.has("TRANSPORTER_LANDFILL") &&
      !isTreated &&
      !groupsIds
    ) {
      return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
    }
  }

  if (!hasTreatment && disposalSet.has("TRANSPORTER_RECYCLER") && isTreated && groupsIds && groupsIds.length > 0) {
    return ["IN_TEMPORARY_STORAGE", "STERILISED", "IN_TRANSIT", "RECYCLED"];
  }

  if (disposalSet.has("GOVERNMENT_WASTE_TRANSPORT")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "DISPOSED"];
  }

  if (!hasTreatment && disposalSet.has("TRANSPORTER_TREATMENT")) {
    return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
  }

  if (hasTreatment && disposalSet.has("TRANSPORTER_TREATMENT")) {
    if (isTreated && groupsIds && groupsIds.length > 0) {
      if (treatmentSet.has("PYROLYSIS")) {
        return ["IN_TEMPORARY_STORAGE", "INCINERATED", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
      }
      if (treatmentSet.has("DISINFECTION")) {
        return ["IN_TEMPORARY_STORAGE", "STERILISED", "IN_TRANSIT", "READY_FOR_TREATMENT", "RECYCLED"];
      }
    } else {
      if (treatmentSet.has("PYROLYSIS")) {
        return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "LANDFILLED"];
      }
      if (treatmentSet.has("DISINFECTION")) {
        return ["IN_TEMPORARY_STORAGE", "IN_TRANSIT", "READY_FOR_TREATMENT", "RECYCLED"];
      }
    }
  }

  return undefined;
}
