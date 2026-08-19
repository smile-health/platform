'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormRoot,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import Plus from '@repo/ui/components/icons/Plus';
import Reload from '@repo/ui/components/icons/Reload';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import useWmsRouter from '@/utils/hooks/useWmsRouter';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { isSanitarian, loggedAsAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import WasteSourceTable from './components/WasteSourceTable';
import { useWasteSourceTable } from './hooks/useWasteSourceTable';

const WasteSourceListPage: React.FC = () => {
  usePermission('waste-source-view');
  const route = useWmsRouter();

  const { t } = useTranslation(['common', 'wasteSource']);

  const {
    handleChangePage: handleChangePageWasteSource,
    handleChangePaginate: handleChangePaginateWasteSource,
    isLoading: isLoadingWasteSource,
    wasteSourceDataSource,
    pagination: paginationWasteSource,
    filter,
    setPagination,
  } = useWasteSourceTable();

  return (
    <Container
      title={t('wasteSource:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Waste Source`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-end ui-items-center">
          {!(loggedAsAdmin() || isSanitarian()) && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() => route.push('/waste-source/create')}
            >
              {t('wasteSource:list.button.add_waste_source')}
            </Button>
          )}
        </div>

        {/* Filter Form */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
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
          </FilterFormBody>

          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <WasteSourceTable
            isLoading={isLoadingWasteSource}
            size={paginationWasteSource.paginate}
            page={paginationWasteSource.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationWasteSource.paginate}
              onChange={(paginate) => handleChangePaginateWasteSource(paginate)}
              perPagesOptions={wasteSourceDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationWasteSource.paginate}
              currentPage={paginationWasteSource.page}
              total={wasteSourceDataSource?.data.pagination.total}
            />
            <Pagination
              totalPages={wasteSourceDataSource?.data.pagination.pages ?? 0}
              currentPage={paginationWasteSource.page}
              onPageChange={(page) => handleChangePageWasteSource(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default WasteSourceListPage;
