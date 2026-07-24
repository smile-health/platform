import i18n from '@/locales/i18n';
import { TPartnership } from '@/types/partnership';
import { parseDate } from '@internationalized/date';
import { OptionType } from '@repo/ui/components/react-select';
import dayjs from 'dayjs';
import {
  PartnershipStatusOption,
  partnershipStatusValues,
  providerTypeValues,
} from '../constants/partnership';

const defaultPartnership = {
  entity: null,
  partnershipStatus: '',
  providerType: '',
  picName: '',
  picPhoneNumber: '',
  picPosition: '',
  pricePerKg: '',
  contractDate: undefined,
  wasteTypeId: 0,
  wasteGroupId: 0,
  wasteCharacteristicsId: 0,
  wasteClassificationId: 0,
  contractId: '',
  wasteClassification: [], // For Create mode
};

export const handleDefaultValuePartnership = (data?: TPartnership) => {
  if (!data) return defaultPartnership;

  if (data.id) {
    return {
      ...defaultPartnership,
      entity: data.providerDetail
        ? {
            value: data.providerDetail.id,
            label: data.providerDetail.name ?? '',
          }
        : null,
      partnershipStatus: data.partnershipStatus,
      providerType: data.providerType,
      picName: data.picName,
      picPhoneNumber: data.picPhoneNumber,
      picPosition: data.picPosition,
      pricePerKg: data.pricePerKg?.toString() || '',
      contractDate:
        data?.contractStartDate && data?.contractEndDate
          ? {
              start: parseDate(
                dayjs(data.contractStartDate).format('YYYY-MM-DD')
              ),
              end: parseDate(dayjs(data.contractEndDate).format('YYYY-MM-DD')),
            }
          : undefined,
      wasteTypeId: data.wasteClassification?.wasteTypeId || 0,
      wasteGroupId: data.wasteClassification?.wasteGroupId || 0,
      wasteCharacteristicsId:
        data.wasteClassification?.wasteCharacteristicsId || 0,
      wasteClassificationId: data.wasteClassificationId || 0,
      contractId: data.contractId,
    };
  }

  return defaultPartnership;
};

export const getPartnershipStatusOptions = (): PartnershipStatusOption[] => {
  return partnershipStatusValues.map((status) => ({
    ...status,
    label: i18n.t(`status_partnership.${status.value}`, {
      ns: 'partnership',
    }),
  }));
};

export const getProviderTypeOptions = (): OptionType[] => {
  return providerTypeValues.map((value) => ({
    ...value,
    label: i18n.t(`provider_type.${value.value}`, {
      ns: 'partnership',
    }),
  }));
};
