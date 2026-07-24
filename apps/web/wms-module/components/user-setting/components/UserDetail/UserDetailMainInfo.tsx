import { RenderDetailValue } from '@/components/RenderDetailValue';
import { CommonType } from '@/types/common';
import { TUser } from '@/types/user';
import { Badge } from '@repo/ui/components/badge';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

type UserDetailMainInfoProps = CommonType & {
  detailData?: TUser;
  isLoading?: boolean;
};

export default function UserDetailMainInfo(props: UserDetailMainInfoProps) {
  const { isLoading, detailData } = props;
  const { t } = useTranslation(['userSetting', 'common']);

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">{t('title.details')}</h5>
      </div>
      <Badge
        rounded="full"
        color={detailData?.is_active ? 'success' : 'danger'}
        variant="light"
      >
        {detailData?.is_active
          ? t('filter.status.active')
          : t('filter.status.inactive')}
      </Badge>
      <RenderDetailValue
        labelsClassName="ui-text-left"
        valuesClassName="ui-text-left"
        loading={isLoading}
        data={[
          {
            label: t('column.username'),
            value: detailData?.username ?? '-',
          },
          {
            label: t('column.role'),
            value: detailData?.userRole?.name ?? '-',
          },
          {
            label: t('column.email'),
            value: detailData?.email ?? '-',
          },
          {
            label: t('column.firstname'),
            value: detailData?.firstname ?? '-',
          },
          {
            label: t('column.lastname'),
            value: detailData?.lastname ?? '-',
          },
          {
            label: t('column.location'),
            value: detailData?.address ?? '-',
          },
          {
            label: t('column.mobile_phone'),
            value: detailData?.mobile_phone ?? '-',
          },
          {
            label: t('column.birthdate'),
            value: detailData?.date_of_birth
              ? dayjs(detailData?.date_of_birth).format('DD/MM/YYYY')
              : '-',
          },
          {
            label: t('column.gender'),
            value:
              detailData?.gender === 1
                ? t('common:gender.male')
                : t('common:gender.female'),
          },
          {
            label: t('column.view_only'),
            value: detailData?.view_only ? t('common:yes') : t('common:no'),
          },
        ]}
      />
    </div>
  );
}
