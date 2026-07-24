'use client';

import AppLayout from '@/components/layouts/AppLayout/AppLayout';
import Meta from '@/components/layouts/Meta';
import { generateMetaTitle } from '@repo/ui/utils/strings';
import { useTranslation } from 'react-i18next';

import { usePermission } from '@/utils/permission';
import { useRouter } from 'next/router';
import WasteCharacteristicForm from './components/WasteCharacteristicForm';
import WasteGroupForm from './components/WasteGroupForm';
import WasteTypeForm from './components/WasteTypeForm';

const WasteHierarchyCreatePage = (): JSX.Element => {
  usePermission('waste-hierarchy-mutate');
  const { t } = useTranslation('wasteHierarchy');
  const router = useRouter();
  const { tab } = router.query;

  const isWasteType = tab === 'waste_type';
  const isWasteGroup = tab === 'waste_group';

  return (
    <AppLayout
      title={
        isWasteType
          ? t('title.create_waste_type')
          : isWasteGroup
            ? t('title.create_waste_group')
            : t('title.create_waste_characteristic')
      }
    >
      <Meta
        title={generateMetaTitle(
          isWasteType
            ? t('title.create_waste_type')
            : isWasteGroup
              ? t('title.create_waste_group')
              : t('title.create_waste_characteristic'),
          false,
          false
        )}
      />
      <div className="mt-6">
        {isWasteType ? (
          <WasteTypeForm />
        ) : isWasteGroup ? (
          <WasteGroupForm />
        ) : (
          <WasteCharacteristicForm />
        )}
      </div>
    </AppLayout>
  );
};

export default WasteHierarchyCreatePage;
