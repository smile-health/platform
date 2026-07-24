import {
  TWasteTrackingCharacteristics,
  TWasteTrackingCharacteristicsRow,
} from '@/types/tracking';
import { mapWasteStatus } from '@/utils/mappingWasteStatus';

const DISPOSAL_METHOD_ORDER: Record<string, number> = {
  TRANSPORTER_RECYCLER: 1,
  TRANSPORTER_LANDFILL: 2,
  TRANSPORTER_TREATMENT: 3,
  TRANSPORTER_GOVERNMENT_WASTE_BANK: 4,
};

const getDisposalMethodRank = (method?: string) =>
  DISPOSAL_METHOD_ORDER[method ?? ''] ?? Number.MAX_SAFE_INTEGER;

const WASTE_STATUS_ORDER: Record<string, number> = {
  IN_TEMPORARY_STORAGE: 1,
  IN_COLD_STORAGE: 1,
  READY_FOR_TRANSPORT: 2,
  TRANSPORTATION_REQUEST_CREATED: 3,
  IN_TRANSIT: 4,
  HANDOVER_TO_TREATMENT: 5,
  READY_FOR_TREATMENT: 6,
  IN_THIRD_PARTY_STORAGE: 7,
  INCINERATION_IN_PROCESS: 8,
  STERILIZATION_IN_PROCESS: 8,
};

const getWasteStatusRank = (status?: string) =>
  WASTE_STATUS_ORDER[status ?? ''] ?? Number.MAX_SAFE_INTEGER;

const getWasteStatusLabel = (status?: string) =>
  status ? mapWasteStatus(status) : '';

export function transformWasteData(
  data: TWasteTrackingCharacteristics[] | undefined
): TWasteTrackingCharacteristicsRow[] {
  const getGroupKey = (item: TWasteTrackingCharacteristics) =>
    `${item.healthcareFacilityName}::${item.wasteCharacteristicsName}`;

  const sortedData = [...(data ?? [])].sort((a, b) => {
    const facilityCompare = (a.healthcareFacilityName ?? '').localeCompare(
      b.healthcareFacilityName ?? ''
    );
    if (facilityCompare !== 0) return facilityCompare;

    const characteristicCompare = (
      a.wasteCharacteristicsName ?? ''
    ).localeCompare(b.wasteCharacteristicsName ?? '');
    if (characteristicCompare !== 0) return characteristicCompare;

    const statusCompare =
      getWasteStatusRank(a.wasteStatus) - getWasteStatusRank(b.wasteStatus);
    if (statusCompare !== 0) return statusCompare;

    const disposalCompare =
      getDisposalMethodRank(a.disposalMethod) -
      getDisposalMethodRank(b.disposalMethod);
    if (disposalCompare !== 0) return disposalCompare;

    return getWasteStatusLabel(a.wasteStatus).localeCompare(
      getWasteStatusLabel(b.wasteStatus)
    );
  });

  const groupCount: Record<string, number> = {};
  const facilityCount: Record<string, number> = {};
  sortedData.forEach((item) => {
    const key = getGroupKey(item);
    groupCount[key] = (groupCount[key] || 0) + 1;

    const facilityKey = item.healthcareFacilityName ?? '';
    facilityCount[facilityKey] = (facilityCount[facilityKey] || 0) + 1;
  });

  const result: TWasteTrackingCharacteristicsRow[] = [];
  const groupProcessed: Record<string, boolean> = {};
  const facilityProcessed: Record<string, boolean> = {};

  sortedData.forEach((item) => {
    const key = getGroupKey(item);
    const facilityKey = item.healthcareFacilityName ?? '';

    const isFirstInFacility = !facilityProcessed[facilityKey];
    if (isFirstInFacility) facilityProcessed[facilityKey] = true;

    if (!groupProcessed[key]) {
      groupProcessed[key] = true;
      result.push({
        ...item,
        rowSpan: groupCount[key],
        facilityRowSpan: isFirstInFacility ? facilityCount[facilityKey] : 0,
        isLabel: true,
      });
    } else {
      result.push({
        ...item,
        rowSpan: 0,
        facilityRowSpan: isFirstInFacility ? facilityCount[facilityKey] : 0,
        isLabel: false,
      });
    }
  });

  return result;
}

export function formatEnumType(value: string): string {
  if (!value) return '';
  return value
    .split('_')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');
}
