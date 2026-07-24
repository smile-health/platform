import {
  getInternalTreatmentOptions,
  getSourceTypeOptions,
} from '@/components/waste-source/utils/helper';
import { TPrintLabel } from '@/types/print-label';
import { SourceType } from '@/types/waste-source';

export function getWasteSourceLabel(
  wasteSource?: TPrintLabel['wasteSource']
): string {
  let name = '-';
  switch (wasteSource?.sourceType) {
    case SourceType.INTERNAL:
      name = wasteSource?.internalSourceName ?? '-';
      break;
    case SourceType.EXTERNAL:
      name = wasteSource?.externalHealthcareFacilityName ?? '-';
      break;
    case SourceType.INTERNAL_TREATMENT:
      name =
        getInternalTreatmentOptions().find(
          (option) => option.value === wasteSource?.internalTreatmentName
        )?.label ?? '-';
      break;
  }
  const sourceTypeLabel =
    getSourceTypeOptions().find((opt) => opt.value === wasteSource?.sourceType)
      ?.label ||
    wasteSource?.sourceType ||
    '-';
  return `${sourceTypeLabel} - ${name}`;
}
