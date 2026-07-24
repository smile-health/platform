'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { getUserStorage } from '@/utils/storage/user';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import Reload from '@repo/ui/components/icons/Reload';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { TabsList, TabsRoot, TabsTrigger } from '@repo/ui/components/tabs';
import { parseAsString, useQueryStates } from 'nuqs';
import { useTranslation } from 'react-i18next';
import HomeTPTransportTable from './components/table/HomeTPTransportTable';
import HomeTPTreatmentTable from './components/table/HomeTPTreatmentTable';
import { ProviderTypeTP } from './constants/constant.home';
import { useHomeTPTable } from './hooks/useHomeTPTable';

export default function HomeTPAdmin() {
  const { t } = useTranslation(['common', 'home']);
  const user = getUserStorage();
  const providerTypesArray = user?.providerTypes
    ? user?.providerTypes.split(',').map((s) => s.trim())
    : [];

  const getDefaultTab = () => {
    const userProviderTypes = providerTypesArray || [];

    const hasSubstring = (substring: string): boolean =>
      userProviderTypes.some((type) => type.includes(substring));

    const showsTransporterTab =
      hasSubstring('TRANSPORTER') || hasSubstring('SPECIALIZED');
    const showsTreatmentTab =
      userProviderTypes.includes('TREATMENT') &&
      !hasSubstring('SPECIALIZED') &&
      !hasSubstring('GOVERNMENT');

    const showsLandfillTab = hasSubstring('LANDFILL');
    const showsRecyclerTab = hasSubstring('RECYCLER');
    const showsSpecializedTab = userProviderTypes.includes(
      'SPECIALIZED_TREATMENT_PROVIDER'
    );
    const showsGovernmentTab = userProviderTypes.includes(
      'TRANSPORTER_GOVERNMENT'
    );
    const showsWasteBankTab =
      userProviderTypes.includes('GOVERNMENT_WASTE_BANK') &&
      !userProviderTypes.includes('TRANSPORTER_GOVERNMENT');

    if (showsTransporterTab) return ProviderTypeTP.TRANSPORTER;
    if (showsTreatmentTab) return ProviderTypeTP.TREATMENT;
    if (showsLandfillTab) return ProviderTypeTP.LANDFILLER;
    if (showsRecyclerTab) return ProviderTypeTP.RECYCLER;
    if (showsSpecializedTab) return ProviderTypeTP.SPECIALIZED;
    if (showsGovernmentTab) return ProviderTypeTP.GOVERNMENT;
    if (showsWasteBankTab) return ProviderTypeTP.GOVERNMENT_WASTE_BANK;

    return ProviderTypeTP.TRANSPORTER;
  };

  const [query, setQuery] = useQueryStates(
    {
      tab: parseAsString.withDefault(getDefaultTab()),
    },
    { history: 'push' }
  );

  const {
    filter,
    handleChangePage,
    handleChangePaginate,
    isLoading,
    pagination,
    setPagination,
    wasteGroupDataSource,
  } = useHomeTPTable(query.tab);

  return (
    <Container title={t('home:title')} hideTabs={false} withLayout={true}>
      <Meta title={`WMS | ${t('home:title')}`} />

      <div className="ui-mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-semibold ui-text-lg">{t('home:title')}</h5>
        </div>
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid ui-grid-cols-4 ui-gap-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-flex ui-space-x-3 ui-items-center">
              <Button
                variant="subtle"
                type="button"
                leftIcon={<Reload className="ui-size-5" />}
                onClick={filter.reset}
              >
                {t('common:reset')}
              </Button>
              <FilterSubmitButton
                variant="outline"
                className="ui-w-48"
                text={t('common:search')}
                onClick={() => setPagination({ page: 1 })}
              />
            </div>
          </FilterFormFooter>

          {filter.renderActiveFilter()}
        </FilterFormRoot>
      </div>

      <div className="ui-w-full ui-mx-auto ui-border ui-border-gray-200 ui-rounded-lg ui-mt-5">
        <TabsRoot
          value={query.tab}
          variant="pills"
          grow={true}
          align="stretch"
          onValueChange={(e) => setQuery({ tab: e })}
          className=""
        >
          <TabsList>
            {providerTypesArray.some(
              (item) =>
                item.includes('TRANSPORTER') || item.includes('SPECIALIZED')
            ) && (
              <TabsTrigger
                value={ProviderTypeTP.TRANSPORTER}
                className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
              >
                {t('home:home_tp.tab.transport')}
              </TabsTrigger>
            )}
            {providerTypesArray.includes('TREATMENT') &&
              !providerTypesArray.some(
                (item) =>
                  item.includes('SPECIALIZED') || item.includes('GOVERNMENT')
              ) && (
                <TabsTrigger
                  value={ProviderTypeTP.TREATMENT}
                  hidden={true}
                  className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
                >
                  {t('home:home_tp.tab.treatment')}
                </TabsTrigger>
              )}
            {providerTypesArray.some((item) => item.includes('LANDFILL')) && (
              <TabsTrigger
                value={ProviderTypeTP.LANDFILLER}
                className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
              >
                {t('home:home_tp.tab.landfill')}
              </TabsTrigger>
            )}
            {providerTypesArray.some((item) => item.includes('RECYCLER')) && (
              <TabsTrigger
                value={ProviderTypeTP.RECYCLER}
                className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
              >
                {t('home:home_tp.tab.recycle')}
              </TabsTrigger>
            )}
            {providerTypesArray.includes('SPECIALIZED_TREATMENT_PROVIDER') && (
              <TabsTrigger
                value={ProviderTypeTP.SPECIALIZED}
                className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
              >
                {t('home:home_tp.tab.specialized')}
              </TabsTrigger>
            )}
            {providerTypesArray.includes('TRANSPORTER_GOVERNMENT') && (
              <TabsTrigger
                value={ProviderTypeTP.GOVERNMENT}
                className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
              >
                {t('home:home_tp.tab.government')}
              </TabsTrigger>
            )}
            {providerTypesArray.includes('GOVERNMENT_WASTE_BANK') &&
              !providerTypesArray.includes('TRANSPORTER_GOVERNMENT') && (
                <TabsTrigger
                  value={ProviderTypeTP.GOVERNMENT_WASTE_BANK}
                  className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
                >
                  {t('home:home_tp.tab.waste_bank')}
                </TabsTrigger>
              )}
          </TabsList>
        </TabsRoot>
      </div>

      <div className="ui-mt-5">
        {query.tab === ProviderTypeTP.TRANSPORTER ? (
          <HomeTPTransportTable
            activeTab={query.tab}
            isLoading={isLoading}
            page={pagination.page}
            size={pagination.paginate}
          />
        ) : (
          <HomeTPTreatmentTable
            activeTab={query.tab}
            isLoading={isLoading}
            page={pagination.page}
            size={pagination.paginate}
          />
        )}
        <PaginationContainer className="ui-mt-5">
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={(paginate) => handleChangePaginate(paginate)}
            perPagesOptions={wasteGroupDataSource?.list_pagination}
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={wasteGroupDataSource?.data?.pagination?.total}
          />
          <Pagination
            totalPages={wasteGroupDataSource?.data?.pagination?.pages ?? 0}
            currentPage={pagination.page}
            onPageChange={(page) => handleChangePage(page)}
          />
        </PaginationContainer>
      </div>
    </Container>
  );
}
