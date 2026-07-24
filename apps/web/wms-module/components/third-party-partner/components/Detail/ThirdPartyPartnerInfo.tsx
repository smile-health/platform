import { getPartnershipStatusOptions } from '@/components/partnership/utils/helper';
import i18n from '@/locales/i18n';
import { TPartnership } from '@/types/partnership';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { getProviderTypeOptions } from '../../utils/helper';

type ThirdPartyPartnerProps = {
  data?: TPartnership;
  isLoading: boolean;
};

const ThirdPartyPartnerInfo: React.FC<ThirdPartyPartnerProps> = ({
  data,
  isLoading,
}) => {
  const { t } = useTranslation(['common', 'thirdPartyPartner']);

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('thirdPartyPartner:detail.third_party_info')}
        </h5>
      </div>
      <RenderDetailValue
        loading={isLoading}
        data={[
          {
            label: t('thirdPartyPartner:list.column.partnership_type'),
            value:
              getProviderTypeOptions().find(
                (option) => option.value === data?.providerType
              )?.label ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.company_name'),
            value: data?.providerDetail?.name ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.nib'),
            value: data?.nib ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.province'),
            value: data?.providerDetail?.locations?.[0]?.name ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.city'),
            value: data?.providerDetail?.locations?.[1]?.name ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.address'),
            value: data?.providerDetail?.address ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.latitude'),
            value: data?.providerDetail?.lat ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.longitude'),
            value: data?.providerDetail?.lng ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.healthcare_facility'),
            value: data?.consumerDetail?.name ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.waste_characteristic'),
            value:
              (i18n.language === 'id'
                ? data?.wasteClassification?.wasteCharacteristics?.name
                : data?.wasteClassification?.wasteCharacteristics?.nameEn) ??
              '-',
          },
          {
            label: t('thirdPartyPartner:list.column.price_kg'),
            value: data?.pricePerKg ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.contract_start_date'),
            value: data?.contractStartDate
              ? dayjs(data?.contractStartDate).format('DD/MM/YYYY')
              : '-',
          },
          {
            label: t('thirdPartyPartner:list.column.contract_end_date'),
            value: data?.contractEndDate
              ? dayjs(data?.contractEndDate).format('DD/MM/YYYY')
              : '-',
          },
          {
            label: t('thirdPartyPartner:list.column.contract_id'),
            value: data?.contractId ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.partnership_status'),
            value:
              getPartnershipStatusOptions().find(
                (status) => status.value === data?.partnershipStatus
              )?.label ?? '-',
          },
          {
            label: t('thirdPartyPartner:list.column.last_updated'),
            value: data?.updatedAt
              ? dayjs(data?.updatedAt).format('DD/MM/YYYY')
              : '-',
          },
        ]}
      />
    </div>
  );
};

export default ThirdPartyPartnerInfo;
