// Ports apps/wms-service's shared/utils/generateWasteGroupId.ts and
// shared/utils/wasteMiscellaneous.ts's getTotalWeightFromWasteBags verbatim
// (both are pure functions with no DB/cache dependency — despite this
// module's groupId being superficially similar in spirit to
// waste-bag-qr-code's per-day-counter id, the original's groupId is fully
// deterministic from its inputs and does NOT use a Redis/cache counter；
// nothing here needs wms-encore's shared cacheCluster).

// Mirrors generateWasteGroupId's status union exactly (the original's
// createWasteTransportationGroup always calls this with a hardcoded
// providerType of '' -> the switch's `default` branch -> 'TRANSPORTER_TREATMENT'
// -> code '1EX-', see service.ts's createWasteTransportationGroup; the other
// members are preserved here only because the shared util's type signature
// declares them, even though this call site can never actually reach them).
export type WasteGroupIdStatus =
  | "IN_TEMPORARY_STORAGE"
  | "IN_COLD_STORAGE"
  | "INCINERATION_IN_PROCESS"
  | "STERILIZATION_IN_PROCESS"
  | "INCINERATED"
  | "STERILISED"
  | "INTERNAL_LANDFILL_IN_PROCESS"
  | "INTERNAL_LANDFILLED"
  | "TRANSPORTER_LANDFILL"
  | "TRANSPORTER_RECYCLER"
  | "TRANSPORTER_TREATMENT"
  | "TRANSPORTER_GOVERNMENT"
  | "TRANSPORTER_GOVERNMENT_WASTE_BANK"
  | "SPECIALIZED_TREATMENT_PROVIDER";

export function generateWasteGroupId(wasteBagQrCodeIds: string[], event: WasteGroupIdStatus): string {
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${currentDate.getFullYear()}`;
  // Original: `.sort((a, b) => Number(a) - Number(b)).at(-1)?.substring(0, 4)`
  // — sorts ascending (mutates the input array, preserved verbatim) and
  // takes the *largest* id's first 4 characters as the prefix.
  const prefix = wasteBagQrCodeIds.sort((a, b) => Number(a) - Number(b)).at(-1)?.substring(0, 4) ?? "";

  let code: string;
  switch (event) {
    case "IN_COLD_STORAGE":
      code = "-";
      break;
    case "IN_TEMPORARY_STORAGE":
      code = "-";
      break;
    case "INTERNAL_LANDFILL_IN_PROCESS":
      code = "3IN-";
      break;
    case "INCINERATION_IN_PROCESS":
      code = "1IN-";
      break;
    case "STERILIZATION_IN_PROCESS":
      code = "2IN-";
      break;
    case "TRANSPORTER_LANDFILL":
      code = "2EX-";
      break;
    case "TRANSPORTER_RECYCLER":
      code = "3EX-";
      break;
    case "SPECIALIZED_TREATMENT_PROVIDER":
      code = "4EX-";
      break;
    case "TRANSPORTER_GOVERNMENT":
      code = "5EX-";
      break;
    case "TRANSPORTER_GOVERNMENT_WASTE_BANK":
      code = "6EX-";
      break;
    default:
      code = "1EX-";
      break;
  }

  return code + prefix + formattedDate;
}

// Mirrors getTotalWeightFromWasteBags verbatim, including the original's
// footgun: it throws if ANY bag in the list has a null/zero/negative/NaN
// weight, rather than skipping it — preserved as-is (a bag with no recorded
// weight yet makes group creation fail entirely).
export function getTotalWeightFromWasteBags(wasteBags: { weightInKgs: number | null }[]): number {
  if (!wasteBags.length) return 0;
  let totalWeight = 0;
  for (const bag of wasteBags) {
    const weight = Number(bag.weightInKgs);
    if (Number.isNaN(weight) || weight <= 0) {
      throw new Error(`Invalid weight value: ${bag.weightInKgs}`);
    }
    totalWeight += weight;
  }
  return totalWeight;
}
