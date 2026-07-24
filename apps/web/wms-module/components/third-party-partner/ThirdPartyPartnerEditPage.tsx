'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';

import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@repo/ui/components/spinner';
import ThirdPartyPartnerForm from './components/ThirdPartyPartnerForm';

import { usePermission } from '@/utils/permission';
import { useThirdPartyPartnerDetail } from './hooks/useThirdPartyPartnerDetail';

const ThirdPartyPartnerEditPage = (): JSX.Element => {
  usePermission('thirdparty-partner-mutate');
  const { t } = useTranslation(['common', 'thirdPartyPartner']);

  const { partnershipDetail, isLoading } = useThirdPartyPartnerDetail();

  return (
    <AppLayout title={t('thirdPartyPartner:title.edit')}>
      <Meta title={generateMetaTitle('Third Party Partner', true, true)} />
      <div className="mt-6 space-y-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <ThirdPartyPartnerForm defaultValues={partnershipDetail} />
        )}
      </div>
    </AppLayout>
  );
};

export default ThirdPartyPartnerEditPage;
