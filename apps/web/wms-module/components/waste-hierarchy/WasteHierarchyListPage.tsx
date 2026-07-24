'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { loggedAsAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import Information from '@repo/ui/components/icons/Information';
import Plus from '@repo/ui/components/icons/Plus';
import Reload from '@repo/ui/components/icons/Reload';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { TabsList, TabsRoot, TabsTrigger } from '@repo/ui/components/tabs';
import { useRouter } from 'next/router';
import { parseAsString, useQueryStates } from 'nuqs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import WasteHierachyTable from './components/WasteHierachyTable';
import { useWasteHierarchyTable } from './hooks/useWasteHierarchyTable';
import TooltipModal from '@/components/TooltipModal';

const WasteHierarchyListPage: React.FC = () => {
  usePermission('waste-hierarchy-view');
  const route = useRouter();

  const { t, i18n } = useTranslation(['common', 'wasteHierarchy']);
  const locale = i18n.language;

  const [openInformation, setOpenInformation] = React.useState(false);

  const [query, setQuery] = useQueryStates(
    {
      tab: parseAsString.withDefault('waste_type'),
    },
    { history: 'push' }
  );

  const getLevelFromTab = (tab: string): number => {
    if (tab === 'waste_type') return 0;
    if (tab === 'waste_group') return 1;
    return 2;
  };

  const {
    handleChangePage: handleChangePageWasteHierarchy,
    handleChangePaginate: handleChangePaginateWasteHierarchy,
    isLoading: isLoadingWasteHierarchy,
    wasteHierarchyDataSource,
    pagination: paginationWasteHierarchy,
    filter,
    setPagination,
  } = useWasteHierarchyTable({
    level: getLevelFromTab(query.tab),
    tab: query.tab,
  });

  const getPageTitle = () => {
    if (query.tab === 'waste_type')
      return t('wasteHierarchy:list.tab.waste_type');
    if (query.tab === 'waste_group')
      return t('wasteHierarchy:list.tab.waste_group');
    return t('wasteHierarchy:list.tab.waste_characteristic');
  };

  const getAddButtonLabel = () => {
    if (query.tab === 'waste_type')
      return t('wasteHierarchy:list.button.add_waste_type');
    if (query.tab === 'waste_group')
      return t('wasteHierarchy:list.button.add_waste_group');
    return t('wasteHierarchy:list.button.add_waste_characteristic');
  };

  return (
    <Container
      title={t('wasteHierarchy:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Waste Hierarchy`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('wasteHierarchy:information.title')}
        description={t('wasteHierarchy:information.description')}
      />
      <div className="ui-w-full ui-space-y-6 ui-max-w-form ui-mx-auto ui-border ui-border-gray-200 ui-rounded-lg">
        <TabsRoot
          value={query.tab}
          variant="pills"
          grow={true}
          align="stretch"
          onValueChange={(e) => {
            filter.reset();
            setQuery({ tab: e });
          }}
          className=""
        >
          <TabsList>
            <TabsTrigger
              value="waste_type"
              className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
            >
              {t('wasteHierarchy:list.tab.waste_type')}
            </TabsTrigger>
            <TabsTrigger
              value="waste_group"
              className="ui-flex ui-items-center ui-justify-center ui-border-r ui-border-gray-200 ui-rounded-r-none"
            >
              {t('wasteHierarchy:list.tab.waste_group')}
            </TabsTrigger>
            <TabsTrigger
              value="waste_characteristic"
              className="ui-flex ui-items-center ui-justify-center"
            >
              {t('wasteHierarchy:list.tab.waste_characteristic')}
            </TabsTrigger>
          </TabsList>
        </TabsRoot>
      </div>

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">{getPageTitle()}</h5>
          <div className="ui-flex ui-flex-col ui-gap-2">
            {!loggedAsAdmin() && (
              <Button
                leftIcon={<Plus className="ui-size-5" />}
                loading={false}
                disabled={false}
                onClick={() =>
                  route.push(
                    `/${locale}/waste-hierarchy/create?tab=${query.tab}`
                  )
                }
              >
                {getAddButtonLabel()}
              </Button>
            )}
            <Button
              leftIcon={<Information className="ui-size-5" />}
              loading={false}
              color="info"
              disabled={false}
              onClick={() => route.push(`/${locale}/waste-classification`)}
            >
              {t('wasteHierarchy:title.explain_waste_classification')}
            </Button>
          </div>
        </div>

        {/* Filter Form */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
            {query.tab !== 'waste_characteristic' && (
              <div className="ui-space-x-3 ui-flex ui-mt-5">
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
            )}
          </FilterFormBody>
          {query.tab === 'waste_characteristic' && (
            <FilterFormFooter>
              <div className="ui-flex ui-justify-end ui-gap-2 ui-w-full">
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
          )}

          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <WasteHierachyTable
            isLoading={isLoadingWasteHierarchy}
            size={paginationWasteHierarchy.paginate}
            page={paginationWasteHierarchy.page}
            tab={query.tab}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationWasteHierarchy.paginate}
              onChange={(paginate) =>
                handleChangePaginateWasteHierarchy(paginate)
              }
              perPagesOptions={wasteHierarchyDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationWasteHierarchy.paginate}
              currentPage={paginationWasteHierarchy.page}
              total={wasteHierarchyDataSource?.data.pagination.total}
            />
            <Pagination
              totalPages={wasteHierarchyDataSource?.data.pagination.pages ?? 0}
              currentPage={paginationWasteHierarchy.page}
              onPageChange={(page) => handleChangePageWasteHierarchy(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default WasteHierarchyListPage;
