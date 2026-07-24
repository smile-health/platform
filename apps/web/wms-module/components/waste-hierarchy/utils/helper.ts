import i18n from '@/locales/i18n';
import {
  GetWasteCharacteristicDetailResponse,
  GetWasteGroupDetailResponse,
  GetWasteTypeDetailResponse,
  TWasteCharacteristic,
  TWasteGroup,
  TWasteHierarchy,
} from '@/types/waste-hierarchy';
import { OptionType } from '@repo/ui/components/react-select';

export function handleDefaultValueWasteType(
  defaultValue?: GetWasteTypeDetailResponse
) {
  const wasteHierarchyValue = defaultValue?.data as TWasteHierarchy;

  return {
    waste_type:
      i18n.language === 'id'
        ? wasteHierarchyValue?.name
        : wasteHierarchyValue?.nameEn || '',
    description:
      i18n.language === 'id'
        ? wasteHierarchyValue?.description
        : wasteHierarchyValue?.descriptionEn || '',
  };
}

export function handleDefaultValueWasteGroup(
  defaultValue?: GetWasteGroupDetailResponse
) {
  const wasteGroupValue = defaultValue?.data as TWasteGroup;

  return {
    waste_type: {
      label:
        i18n.language === 'id'
          ? wasteGroupValue?.wasteType?.name
          : wasteGroupValue?.wasteType?.nameEn || '',
      value: wasteGroupValue?.wasteType?.id || '',
    },
    waste_group:
      i18n.language === 'id'
        ? wasteGroupValue?.name
        : wasteGroupValue?.nameEn || '',
    description:
      i18n.language === 'id'
        ? wasteGroupValue?.description
        : wasteGroupValue?.descriptionEn || '',
  };
}

export function handleDefaultValueWasteCharacteristic(
  defaultValue?: GetWasteCharacteristicDetailResponse
) {
  const wasteCharacteristicValue = defaultValue?.data as TWasteCharacteristic;

  return {
    waste_type: {
      label:
        i18n.language === 'id'
          ? wasteCharacteristicValue?.wasteType?.name
          : wasteCharacteristicValue?.wasteType?.nameEn || '',
      value: wasteCharacteristicValue?.wasteType?.id || '',
    },
    waste_group: {
      label:
        i18n.language === 'id'
          ? wasteCharacteristicValue?.wasteGroup?.name
          : wasteCharacteristicValue?.wasteGroup?.nameEn || '',
      value: wasteCharacteristicValue?.wasteGroup?.id || '',
    },
    waste_characteristic:
      i18n.language === 'id'
        ? wasteCharacteristicValue?.name
        : wasteCharacteristicValue?.nameEn || '',
    description:
      i18n.language === 'id'
        ? wasteCharacteristicValue?.description
        : wasteCharacteristicValue?.descriptionEn || '',
    is_active: wasteCharacteristicValue?.isActive ?? true,
  };
}

export const statusCharacteristicValues = [{ value: 1 }, { value: 0 }] as const;

export const getStatusCharacteristicOptions = (): OptionType[] => {
  return statusCharacteristicValues.map((type) => ({
    value: type.value,
    label: i18n.t(`wasteHierarchy:list.column.is_active.${type.value}`),
  }));
};
