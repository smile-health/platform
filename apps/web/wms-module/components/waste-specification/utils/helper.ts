import i18n from '@/locales/i18n';
import {
  DisposalMethod,
  GetWasteSpecificationDetailResponse,
  TreatmentMethod,
  TWasteSpecification,
} from '@/types/waste-specification';
import { OptionType } from '@repo/ui/components/react-select';
import {
  externalTreatmentValues,
  internalTreatmentValues,
  vehicleTypesValues,
  wasteBagColorValues,
} from '../constants/wasteSpecification';

export function handleDefaultValueWasteSpecification(
  defaultValue?: GetWasteSpecificationDetailResponse
) {
  const wasteSpecificationValue = defaultValue?.data as TWasteSpecification;

  const coldStorageTime =
    (wasteSpecificationValue?.coldStorageMaxHours ?? 0) / 24;
  const tempStorageTime =
    (wasteSpecificationValue?.tempStorageMaxHours ?? 0) / 24;

  return {
    wasteTypeId: wasteSpecificationValue?.wasteTypeId ?? 0,
    wasteGroupId: wasteSpecificationValue?.wasteGroupId ?? 0,
    wasteCharacteristicsId:
      wasteSpecificationValue?.wasteCharacteristicsId ?? 0,
    wasteCode: wasteSpecificationValue?.wasteCode ?? '',
    wasteBagColor: wasteSpecificationValue?.wasteBagColorCode ?? '',
    storageRuleType: wasteSpecificationValue?.storageRuleType ?? '',
    useColdStorage: wasteSpecificationValue?.useColdStorage ?? 0,
    hasMultipleTransporters:
      wasteSpecificationValue?.hasMultipleTransporters ?? 0,
    coldStorageMaxProcessingTime: coldStorageTime,
    temporaryStorageMaxProcessingTime: tempStorageTime,
    storageRule: wasteSpecificationValue?.storageRule ?? '',
    allowHealthcareFacilityTreatment:
      wasteSpecificationValue?.allowHealthcareFacilityTreatment ?? 0,
    minimunDecayDay: wasteSpecificationValue?.minimunDecayDay ?? 0,
    wasteInternalTreatment: wasteSpecificationValue?.treatmentMethod ?? '',
    wasteExternalTreatment: wasteSpecificationValue?.disposalMethod ?? '',
    vehicleType: wasteSpecificationValue?.allowedVehicleTypes ?? '',
  };
}

export const toTitleCase = (str: string) =>
  str
    .toLowerCase()
    .split(/[\s_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const getInternalTreatmentOptions = (): OptionType[] => {
  return internalTreatmentValues.map((type) => ({
    value: type.value,
    label: i18n.t(`internal_treatment.${type.value}`, {
      ns: 'wasteSpecification',
    }),
  }));
};

export const getExternalTreatmentOptions = (
  internalTreatment?: string
): OptionType[] => {
  // If no internal treatment selected, return all options
  if (!internalTreatment) {
    return externalTreatmentValues.map((type) => ({
      value: type.value,
      label: i18n.t(`external_treatment.${type.value}`, {
        ns: 'wasteSpecification',
      }),
    }));
  }

  const internalTreatments = internalTreatment.split(',');

  // If both PYROLYSIS and DISINFECTION are selected, return all options
  const hasPyrolysis = internalTreatments.includes(TreatmentMethod.PYROLYSIS);
  const hasDisinfection = internalTreatments.includes(
    TreatmentMethod.DISINFECTION
  );

  if (hasPyrolysis && hasDisinfection) {
    return externalTreatmentValues.map((type) => ({
      value: type.value,
      label: i18n.t(`external_treatment.${type.value}`, {
        ns: 'wasteSpecification',
      }),
    }));
  }

  // Filter options based on selected internal treatment
  return externalTreatmentValues
    .filter((type) => {
      if (hasPyrolysis) {
        // For PYROLYSIS, exclude TRANSPORTER_RECYCLER
        return type.value !== DisposalMethod.TRANSPORTER_RECYCLER;
      } else if (hasDisinfection) {
        // For DISINFECTION, exclude TRANSPORTER_LANDFILL
        return type.value !== DisposalMethod.TRANSPORTER_LANDFILL;
      }
      // For other cases, include all
      return true;
    })
    .map((type) => ({
      value: type.value,
      label: i18n.t(`external_treatment.${type.value}`, {
        ns: 'wasteSpecification',
      }),
    }));
};

export const getWasteBagColorOptions = (): OptionType[] => {
  return wasteBagColorValues.map((type) => ({
    value: type.value,
    label: i18n.t(`waste_bag_color.${type.value}`, {
      ns: 'wasteSpecification',
    }),
  }));
};

export const getVehicleTypeOptions = (): OptionType[] => {
  return vehicleTypesValues.map((type) => ({
    value: type.value,
    label: i18n.t(`vehicle_type.${type.value}`, {
      ns: 'wasteSpecification',
    }),
  }));
};

export function formatAllowedVehicleTypes(vehicleTypesString?: string): string {
  if (!vehicleTypesString) return '-';

  const vehicleTypeOptions = getVehicleTypeOptions();

  const formatted = vehicleTypesString
    .split(',')
    .map((item) => item.trim().toUpperCase())
    .map(
      (item) =>
        vehicleTypeOptions.find((opt) => opt.value === item)?.label ??
        toTitleCase(item)
    )
    .join(', ');

  return formatted ?? '-';
}
