import { TPrintLabel } from '@/types/print-label';
import { getWasteSourceLabel } from '@/utils/getWasteSourceLabel';

export function handleDefaultValuePrintLabel(defaultValue?: TPrintLabel) {
  return {
    sourceType: defaultValue?.wasteSource?.sourceType ?? '',
    wasteSource: defaultValue?.wasteSource
      ? {
          value: defaultValue?.wasteSource?.id,
          label: getWasteSourceLabel(defaultValue?.wasteSource),
        }
      : null,
    wasteTypeId: defaultValue?.wasteClassification?.wasteTypeId ?? 0,
    wasteGroupId: defaultValue?.wasteClassification?.wasteGroupId ?? 0,
    wasteCharacteristicsId:
      defaultValue?.wasteClassification?.wasteCharacteristicsId ?? 0,
    wasteClassificationId: defaultValue?.wasteClassificationId,
    total_number: defaultValue?.labelCount ?? '',
  };
}
