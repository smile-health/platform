import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';
import { getProviderTypeOptions } from '@/components/third-party-partner/utils/helper';
import { TPartnership } from '@/types/partnership';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import i18n from '@/locales/i18n';

type HealthcarePartnerDetailProps = {
  data?: TPartnership;
};

const HealthcarePartnerDetail: React.FC<HealthcarePartnerDetailProps> = ({
  data,
}) => {
  const { t } = useTranslation(['common', 'healthcarePartner']);
  return (
    <RenderDetailValue
      data={[
        {
          label: t('healthcarePartner:list.column.partnership_type'),
          value:
            getProviderTypeOptions().find(
              (option) => option.value === data?.providerType
            )?.label ?? '-',
        },
        {
          label: t('healthcarePartner:list.column.company_name'),
          value: data?.providerDetail?.name ?? '-',
        },
        {
          label: t('healthcarePartner:list.column.healthcare_facility'),
          value: data?.consumerDetail?.name ?? '-',
        },
        {
          label: t('healthcarePartner:list.column.waste_characteristic'),
          value:
            i18n.language === 'id'
              ? data?.wasteClassification?.wasteCharacteristics?.name
              : (data?.wasteClassification?.wasteCharacteristics?.nameEn ??
                '-'),
        },
        {
          label: t('healthcarePartner:list.column.price_kg'),
          value: data?.pricePerKg ?? '-',
        },

        {
          label: t('healthcarePartner:list.column.contract_start_date'),
          value: data?.contractStartDate
            ? dayjs(data?.contractStartDate).format('DD/MM/YYYY')
            : '-',
        },
        {
          label: t('healthcarePartner:list.column.contract_end_date'),
          value: data?.contractEndDate
            ? dayjs(data?.contractEndDate).format('DD/MM/YYYY')
            : '-',
        },
        {
          label: t('healthcarePartner:list.column.partnership_status'),
          value:
            getPartnershipStatusOptions().find(
              (status) => status.value === data?.partnershipStatus
            )?.label ?? '-',
        },
      ]}
    />
  );
};

export default HealthcarePartnerDetail;
