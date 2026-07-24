import { CommonType } from '@/types/common';
import { useTranslation } from 'react-i18next';

import { RenderDetailValue } from '@/components/RenderDetailValue';
import { TUser } from '@/types/user';

type UserDetailEntityInfoProps = CommonType & {
  entityData?: TUser['entity'];
  isLoading?: boolean;
  entityType?: Array<{ id: number; name: string }>;
};

export default function UserDetailEntityInfo(props: UserDetailEntityInfoProps) {
  const { isLoading, entityData, entityType } = props;
  const { t } = useTranslation('userSetting');

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <h5 className="ui-font-bold">{t('title.detail')}</h5>
      <RenderDetailValue
        labelsClassName="ui-text-left"
        valuesClassName="ui-text-left"
        loading={isLoading}
        data={[
          {
            label: t('column.entity.name'),
            value: entityData?.name ?? '-',
          },
          {
            label: t('column.entity.address'),
            value: entityData?.address ?? '-',
          },
          {
            label: t('column.entity.type'),
            value:
              entityType?.find((x) => x.id === entityData?.type)?.name ?? '-',
          },
        ]}
      />
    </div>
  );
}
