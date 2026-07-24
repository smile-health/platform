import { TDetailEntity, TEntitiesWms } from '@/types/entity';
import { TFunction } from 'i18next';

export const generateEntityAdditionalDetail = (
  t: TFunction<['common', 'entityWMS']>,
  data?: TDetailEntity
) => [
  {
    label: t('entityWMS:detail.additional.vendor'),
    value: data?.is_vendor ? t('common:yes') : t('common:no'),
  },
  {
    label: t('entityWMS:detail.additional.is_primary_health_care'),
    value: data?.is_puskesmas ? t('common:yes') : t('common:no'),
  },
  {
    label: t('entityWMS:detail.additional.asik'),
    value: data?.is_ayosehat ? t('common:yes') : t('common:no'),
  },
];

export const generateEntityDetail = (
  t: TFunction<['common', 'entityWMS']>,
  data?: TEntitiesWms
) => {
  if (!data) return [];
  const setValueDetail = (value?: string | number | null): string | number => {
    if (value !== undefined && value !== null) return value;
    return '-';
  };

  return [
    {
      label: t('entityWMS:form.information.label.satu_sehat_code'),
      value: setValueDetail(data?.id_satu_sehat),
      id: `detail-information-satu-sehat-code`,
    },
    {
      label: t('entityWMS:form.information.label.registration_code'),
      value: setValueDetail(data?.code),
      id: `detail-information-registration-code`,
    },
    {
      label: t('entityWMS:form.information.label.name'),
      value: setValueDetail(data?.name),
      id: `detail-information-entity-name`,
    },
    {
      label: t('entityWMS:form.information.label.head_name'),
      value: setValueDetail(data?.head_name),
      id: `detail-information-head-name`,
    },
    {
      label: t('entityWMS:form.information.label.gender'),
      value: setValueDetail(data?.gender),
      id: `detail-information-gender`,
    },
    {
      label: t('entityWMS:form.information.label.email'),
      value: setValueDetail(data?.email),
      id: `detail-information-email`,
    },
    {
      label: t('entityWMS:form.information.label.phone'),
      value: setValueDetail(data?.mobile_phone),
      id: `detail-information-phone`,
    },
    {
      label: t('entityWMS:form.location.label.address'),
      value: setValueDetail(data?.address),
      id: `detail-information-entity-address`,
    },
    {
      label: 'Latitude',
      value: setValueDetail(data?.latitude),
      id: `detail-information-entity-latitude`,
    },
    {
      label: 'Longitude',
      value: setValueDetail(data?.longitude),
      id: `detail-information-entity-longitude`,
    },
    {
      label: t('entityWMS:detail.details.last_update'),
      value: setValueDetail(data.updated_at),
      id: `detail-information-updated-at`,
    },
  ];
};
