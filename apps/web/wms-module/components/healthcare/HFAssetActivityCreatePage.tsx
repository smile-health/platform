'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { ActivityType } from '@/types/hf-asset-activity';
import { usePermission } from '@/utils/permission';
import HFAssetActivityForm from './components/HFAssetActivityForm';

const HFAssetActivityCreatePage = (): JSX.Element => {
  usePermission('healthcare-activity-mutate');
  const { t } = useTranslation('healthCare');
  const searchParams = useSearchParams();
  const activityType = searchParams.get('activity') as ActivityType;

  const pageTitle =
    {
      [ActivityType.CALIBRATION]: t('title_asset_activity.calibration'),
      [ActivityType.MAINTENANCE]: t('title_asset_activity.maintenance'),
    }[activityType] || t('title_asset_activity.calibration');

  return (
    <AppLayout title={pageTitle}>
      <Meta title={generateMetaTitle(pageTitle, false, false)} />
      <div className="mt-6">
        <HFAssetActivityForm activityType={activityType} />
      </div>
    </AppLayout>
  );
};

export default HFAssetActivityCreatePage;
