'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { getWasteHierarchyClassification } from '@/services/waste-hierarchy';
import { Spinner } from '@repo/ui/components/spinner';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WasteClassificationTable } from './components/WasteClassificationTable';

const WasteClassificationListPage: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'wasteClassification']);

  const { data: allData, isLoading } = useQuery({
    queryKey: ['waste-hierarchy-classification', language],
    queryFn: () => getWasteHierarchyClassification(),
    placeholderData: keepPreviousData,
  });

  // Filter out Immunization waste type
  const excludedTypes = ['Immunization', 'Imunisasi'];
  const rawData =
    allData?.data?.filter(
      (item) => !excludedTypes.includes(item.wasteTypeName)
    ) || [];

  return (
    <Container
      title={t('wasteClassification:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Waste Classification`} />
      <div className="mt-6">
        {isLoading ? (
          <Spinner className="ui-w-full ui-h-10" />
        ) : (
          <WasteClassificationTable rawData={rawData} />
        )}
      </div>
    </Container>
  );
};

export default WasteClassificationListPage;
