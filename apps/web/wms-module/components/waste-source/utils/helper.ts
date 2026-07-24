import i18n from '@/locales/i18n';
import {
  GetWasteSourceDetailResponse,
  TWasteSource,
} from '@/types/waste-source';
import { OptionType } from '@repo/ui/components/react-select';
import {
  internalTreatmentValues,
  sourceTypeValues,
} from '../constants/wasteSource';

export function handleDefaultValueWasteSource(
  defaultValue?: GetWasteSourceDetailResponse
) {
  const wasteSourceValue = defaultValue?.data as TWasteSource;

  return {
    sourceType: wasteSourceValue?.sourceType || '',
    internalSourceName: wasteSourceValue?.internalSourceName || '',
    internalTreatmentName: wasteSourceValue?.internalTreatmentName || '',
    externalHealthcareFacility: wasteSourceValue?.externalHealthcareFacilityId
      ? {
          value: wasteSourceValue?.externalHealthcareFacilityId,
          label: wasteSourceValue?.externalHealthcareFacilityName,
        }
      : null,
  };
}

export const getSourceTypeOptions = (): OptionType[] => {
  return sourceTypeValues.map((type) => ({
    value: type.value,
    label: i18n.t(`source_type.${type.value}`, { ns: 'wasteSource' }),
  }));
};

export const getInternalTreatmentOptions = (): OptionType[] => {
  return internalTreatmentValues.map((value) => ({
    ...value,
    label: i18n.t(`waste_source_treatment.${value.value}`, {
      ns: 'wasteSource',
    }),
  }));
};
