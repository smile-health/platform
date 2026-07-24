import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { CommonType } from '@/types/common';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import EntityDetailInformationContent from './components/EntityDetailTabContents/EntityDetailInformationContent';

const EntityDetailPage: FC<CommonType> = (): JSX.Element => {
  usePermission('entity-view');
  const { t } = useTranslation(['entityWMS', 'user']);

  const title = t('entityWMS:detail.title');

  return (
    <AppLayout title={title} backButton={{ show: true }}>
      <Meta title={`WMS | Detail Entity`} />
      <div className="ui-w-[1200px] ui-mx-auto">
        <EntityDetailInformationContent />
      </div>
    </AppLayout>
  );
};

export default EntityDetailPage;
