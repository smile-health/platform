import { useMemo, useState, useEffect } from 'react';
import { useFilter, UseFilter } from '@repo/ui/components/filter';
import { useTranslation } from 'react-i18next';
import DashboardBox from './components/DashboardBox';
import DashboardFilter from './components/DashboardFilter';
import DashboardTotalWasteBag from './components/DashboardTotalWasteBag';
import DashboardTabs from './components/DashboardTabs';
import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';

import {
  TRANSACTION_MONITORING_TAB_CONTENT,
  transactionChartTabs,
  TransactionChartType,
  transactionDataElementTab,
} from './constants/transaction-monitoring.constant';
import dashboardTransactionMonitoringFilterSchema from './schemas/dashboardTransactionMonitoringFilterSchema';
import useGetWasteGroupChart from './hooks/useGetWasteGroupChart';
import DashboardWasteBagCharacteristicChart from './components/DashboardWasteBagCharacteristicChart';
import DashboardWasteBagGroupChart from './components/DashboardWasteBagGroupChart';
import DashboardTrendWasteBagChart from './components/DashboardTrendWasteBagChart';
import useTransactionMonitoring from './hooks/useTransactionMonitoring';
import {
  getDefaultHealthcareFacilityValue,
  getDefaultProvinceValue,
  getDefaultRegencyValue,
  isHealthcareFacilityEntity,
  isProvinceEntity,
  isRegencyEntity,
} from '@/utils/getUserRole';
import { useDownloadTransactionMonitoring } from './hooks/useDownloadTransactionMonitoring';
import { handleFilter } from './utils/helper';
import TooltipModal from '../TooltipModal';
import { usePermission } from '@/utils/permission';

export default function DashboardTransactionMonitoringPage() {
  usePermission('transaction-monitoring-view');

  const [isClient, setIsClient] = useState(false);
  const [openInformation, setOpenInformation] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  let defaultTab: TransactionChartType;

  if (isHealthcareFacilityEntity() || isRegencyEntity()) {
    defaultTab = TransactionChartType.Entity;
  } else if (isProvinceEntity()) {
    defaultTab = TransactionChartType.Regency;
  } else {
    defaultTab = TransactionChartType.Province;
  }
  const [tab, setTab] = useState<TransactionChartType>(defaultTab);

  const {
    t,
    i18n: { language },
  } = useTranslation('transactionMonitoring');

  const filterSchema = useMemo<UseFilter>(
    () => dashboardTransactionMonitoringFilterSchema(t, language),
    [t, language]
  );

  const filter = useFilter(filterSchema);
  const fixedFilterQuery = useMemo(() => {
    if (isProvinceEntity() && !filter.query?.provinceMonitoring) {
      return {
        ...filter.query,
        provinceMonitoring: getDefaultProvinceValue(),
      };
    }

    if (isRegencyEntity() && !filter.query?.regencyMonitoring) {
      return {
        ...filter.query,
        provinceMonitoring: getDefaultProvinceValue(),
        regencyMonitoring: getDefaultRegencyValue(),
      };
    }

    if (
      isHealthcareFacilityEntity() &&
      !filter.query?.healthcareFacilityMonitoring
    ) {
      return {
        ...filter.query,
        provinceMonitoring: getDefaultProvinceValue(),
        regencyMonitoring: getDefaultRegencyValue(),
        healthcareFacilityMonitoring: getDefaultHealthcareFacilityValue(),
      };
    }

    return filter.query;
  }, [filter.query]);

  const {
    dataWasteGroupSummary,
    dataMonthlyWasteBagSummary,
    isLoading,
  } = useGetWasteGroupChart(fixedFilterQuery);

  const { handleInformationType } = useTransactionMonitoring();

  const elementTab = transactionDataElementTab(t, fixedFilterQuery?.isBags)?.[
    tab
  ];

  const allTabs = transactionChartTabs(t);

  const filteredTabs = useMemo(() => {
    if (isHealthcareFacilityEntity() || isRegencyEntity()) {
      return allTabs.filter(
        (tab) =>
          tab.id !== TransactionChartType.Province &&
          tab.id !== TransactionChartType.Regency
      );
    }

    if (isProvinceEntity()) {
      return allTabs.filter((tab) => tab.id !== TransactionChartType.Province);
    }

    return allTabs;
  }, [allTabs]);

  const {
    downloadTransactionMonitoring,
    isLoading: isLoadingExport,
  } = useDownloadTransactionMonitoring();

  const handleExport = () => {
    const params = handleFilter({
      ...fixedFilterQuery,
      isBags: String(fixedFilterQuery?.isBags),
    });
    downloadTransactionMonitoring(params);
  };

  if (!isClient) return null;

  return (
    <Container
      title={t('title.page')}
      withLayout
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Dashboard Transaction Monitoring`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('information.title')}
        description={t('information.description')}
      />
      <DashboardBox.Provider
        filter={fixedFilterQuery}
        onDownloadAsCSV={handleExport}
      >
        <DashboardFilter
          filter={filter}
          onExport={handleExport}
          isLoadingExport={isLoadingExport}
        />
        <div className="ui-grid ui-gap-x-4 ui-gap-y-6 ui-grid-cols-7">
          <DashboardTotalWasteBag
            id="dashboard-transaction-monitoring-total"
            value={
              handleInformationType(
                String(filter.query.isBags),
                Number(dataWasteGroupSummary?.total)
              )?.value
            }
            isLoading={isLoading}
            exportFileName="Dashboard Transaction Monitoring - Total Waste Bag"
            title={t('title.total', {
              informationType: handleInformationType(fixedFilterQuery?.isBags)
                ?.title,
            })}
          />
          <DashboardWasteBagGroupChart
            id="dashboard-transaction-monitoring-entity-tag"
            data={dataWasteGroupSummary?.data}
            isLoading={isLoading}
            color="#000000"
            isBags={fixedFilterQuery?.isBags}
            exportFileName="Dashboard Transaction Monitoring - By Entity Tag"
            title={t('title.waste_bag_group', {
              informationType: handleInformationType(fixedFilterQuery?.isBags)
                ?.title,
            })}
          />
        </div>
        <DashboardWasteBagCharacteristicChart
          id="dashboard-transaction-monitoring-characteristic"
          color="#064E3B"
          filter={fixedFilterQuery}
          exportFileName="Dashboard Transaction Monitoring - By Entity Tag"
          title={t('title.waste_bag_characteristic', {
            informationType: handleInformationType(fixedFilterQuery?.isBags)
              ?.title,
          })}
          sortPlaceholder={t('title.sort.name', {
            type: t('title.characteristic').toLowerCase(),
          })}
        />
        <DashboardTrendWasteBagChart
          id="dashboard-transaction-monitoring-month"
          data={dataMonthlyWasteBagSummary}
          isLoading={isLoading}
          isBags={fixedFilterQuery?.isBags}
          color="#064E3B"
          exportFileName="Dashboard Transaction Monitoring - By Month"
          title={t('title.trend_waste_bag_month', {
            informationType: handleInformationType(fixedFilterQuery?.isBags)
              ?.title,
          })}
        />
        <DashboardTabs<TransactionChartType>
          id="dashboard-transaction-monitoring-tab"
          tabList={filteredTabs}
          setTab={setTab}
          title={t('title.by', {
            informationType: handleInformationType(fixedFilterQuery?.isBags)
              ?.title,
            title: elementTab?.title,
          })}
          subtitle={elementTab?.subtitle}
          defaultActiveTab={defaultTab}
          renderChild={(item) => {
            const Component =
              TRANSACTION_MONITORING_TAB_CONTENT[
                item?.id as keyof typeof TRANSACTION_MONITORING_TAB_CONTENT
              ];
            return (
              <Component
                id="dashboard-transaction-monitoring-tab"
                filter={fixedFilterQuery}
                tab={item?.id}
                color="#064E3B"
                exportFileName={elementTab?.exportFileName}
                sortPlaceholder={t('title.sort_province')}
              />
            );
          }}
        />
      </DashboardBox.Provider>
    </Container>
  );
}
