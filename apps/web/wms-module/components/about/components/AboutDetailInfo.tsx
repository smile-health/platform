import { TEntitiesWms } from '@/types/entity';
import {
  isHealthcareFacilityEntity,
  isSanitarian,
  isThirdPartyEntity,
} from '@/utils/getUserRole';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import { Button } from '@repo/ui/components/button';
import { RenderDetailValue } from '@repo/ui/components/modules/RenderDetailValue';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

type PartnershipProps = {
  data?: TEntitiesWms;
  isLoading: boolean;
};

const AboutDetailInfo: React.FC<PartnershipProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(['common', 'about']);
  const router = useWmsRouter();
  const { i18n: locale } = useTranslation();
  const language = locale.language;

  const handleAddClick = () => {
    router.push(`/${language}/about/edit`);
  };
  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold ui-text-dark-blue">
          {t('about:title.list')}
        </h5>
        {!isSanitarian() && (
          <Button
            id="btn-edit"
            type="button"
            variant="outline"
            onClick={handleAddClick}
          >
            {t('about:button.edit')}
          </Button>
        )}
      </div>
      <RenderDetailValue
        loading={isLoading}
        data={[
          {
            label: t('about:detail.satu_sehat_code'),
            value: data?.id_satu_sehat || '-',
            hidden: !isHealthcareFacilityEntity(),
          },
          {
            label: t('about:detail.registration_code'),
            value: data?.code || '-',
          },
          {
            label: t('about:detail.entity_name'),
            value: data?.name || '-',
          },
          {
            label: t('about:detail.nib'),
            value: data?.nib || '-',
            hidden: !isThirdPartyEntity(),
          },
          {
            label: t('about:detail.entity_tag'),
            value: data?.tag || '-',
          },
          {
            label: t('about:detail.head_name'),
            value: data?.head_name || '-',
          },
          {
            label: t('about:detail.gender'),
            value:
              data?.gender === 1
                ? t('common:gender.male')
                : t('common:gender.female'),
          },
          {
            label: t('about:detail.email'),
            value: data?.email || '-',
          },
          {
            label: t('about:detail.phone'),
            value: data?.mobile_phone || '-',
          },
          {
            label: t('about:detail.total_bad_room'),
            value: data?.total_bad_room || '-',
            hidden: isThirdPartyEntity(),
          },
          {
            label: t('about:detail.percentage_bad_room'),
            value: data?.percentage_bad_room || '-',
            hidden: isThirdPartyEntity(),
          },
          {
            label: t('about:detail.province'),
            value: data?.province_name || '-',
          },
          {
            label: t('about:detail.city'),
            value: data?.regency_name || '-',
          },
          {
            label: t('about:detail.address'),
            value: data?.address || '-',
          },
          {
            label: t('about:detail.latitude'),
            value: data?.latitude || '-',
          },
          {
            label: t('about:detail.longitude'),
            value: data?.longitude || '-',
          },
          {
            label: t('about:detail.last_updated'),
            value: data?.updated_at
              ? dayjs(data?.updated_at).format('DD/MM/YYYY')
              : '-',
          },
        ]}
      />
    </div>
  );
};

export default AboutDetailInfo;
