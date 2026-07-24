import i18n from '@/locales/i18n';
import {
  PartnershipStatus,
  ProviderType,
  TPartnership,
} from '@/types/partnership';
import { parseDate } from '@internationalized/date';
import { OptionType } from '@repo/ui/components/react-select';
import dayjs from 'dayjs';
import { providerTypeValues } from '../constants/thirdPartyPartner';

export function handleDefaultValueThirdPartyPartner(
  defaultValue?: TPartnership,
  isEdit?: boolean
) {
  return {
    isSameCompany:
      isEdit && defaultValue?.providerId === defaultValue?.transporterId,
    thirdPartyPartner: defaultValue?.providerDetail
      ? {
          value: defaultValue?.providerDetail?.id,
          label: defaultValue?.providerDetail.name ?? '',
        }
      : null,
    healthcarePartner: defaultValue?.consumerDetail
      ? {
          value: defaultValue?.consumerDetail?.id,
          label: defaultValue?.consumerDetail.name ?? '',
        }
      : null,
    partnershipStatus:
      defaultValue?.partnershipStatus ?? PartnershipStatus.ACTIVE,
    contractDate:
      defaultValue?.contractStartDate && defaultValue?.contractEndDate
        ? {
            start: parseDate(
              dayjs(defaultValue.contractStartDate).format('YYYY-MM-DD')
            ),
            end: parseDate(
              dayjs(defaultValue.contractEndDate).format('YYYY-MM-DD')
            ),
          }
        : undefined,
    providerType: defaultValue?.providerType,
    contractId: defaultValue?.contractId,
    wasteClassificationId: defaultValue?.wasteClassificationId,
  };
}

export const getDefaultProviderType = (
  list: OptionType[],
  providerType: ProviderType | undefined
): string => {
  if (!providerType) return '';

  if (
    providerType === ProviderType.TRANSPORTER_GOVERNMENT ||
    providerType === ProviderType.SPECIALIZED_TREATMENT_PROVIDER
  ) {
    return ProviderType.TREATMENT;
  }

  // Handle TRANSPORTER_* cases
  if (providerType.startsWith('TRANSPORTER_')) {
    const baseType = providerType.replace('TRANSPORTER_', '').split('_')[0];
    const match = list.find(({ value }) => value.includes(baseType));
    if (match) return match.value;
  }

  // Fallback to label matching
  const normalized = providerType.toLowerCase();
  const match = list.find(({ label }) => {
    const labelLower = label.toLowerCase();
    return labelLower.includes(normalized) || normalized.includes(labelLower);
  });

  return match?.value || '';
};

export const getProviderTypeOptions = (): OptionType[] => {
  return providerTypeValues.map((value) => ({
    ...value,
    label: i18n.t(`provider_type.${value.value}`, {
      ns: 'thirdPartyPartner',
    }),
  }));
};
