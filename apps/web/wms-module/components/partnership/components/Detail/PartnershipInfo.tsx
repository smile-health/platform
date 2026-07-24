import { TPartnership } from '@/types/partnership';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

type PartnershipProps = {
  data?: TPartnership;
  isLoading: boolean;
};

const PartnershipInfo: React.FC<PartnershipProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(['common', 'partnership']);

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('partnership:detail.healthcare_info')}
        </h5>
      </div>
      <RenderDetailValue
        loading={isLoading}
        data={[
          {
            label: t('partnership:list.column.company_name'),
            value: data?.providerDetail?.name ?? '-',
          },
          {
            label: t('partnership:list.column.nib'),
            value: data?.nib ?? '-',
          },
          {
            label: t('partnership:list.column.pic_name'),
            value: data?.picName ?? '-',
          },
          {
            label: t('partnership:list.column.position'),
            value: data?.picPosition ?? '-',
          },
          {
            label: t('partnership:list.column.phone_number'),
            value: data?.picPhoneNumber ?? '-',
          },
          {
            label: t('partnership:list.column.province'),
            value: data?.providerDetail?.locations?.[0]?.name ?? '-',
          },
          {
            label: t('partnership:list.column.city'),
            value: data?.providerDetail?.locations?.[1]?.name ?? '-',
          },
          {
            label: t('partnership:list.column.address'),
            value: data?.providerDetail?.address ?? '-',
          },
          {
            label: t('partnership:list.column.latitude'),
            value: data?.providerDetail?.latitude ?? '-',
          },
          {
            label: t('partnership:list.column.longitude'),
            value: data?.providerDetail?.longitude ?? '-',
          },
          {
            label: t('partnership:list.column.last_updated'),
            value: data?.updatedAt
              ? dayjs(data?.updatedAt).format('DD/MM/YYYY')
              : '-',
          },
        ]}
      />
    </div>
  );
};

export default PartnershipInfo;
