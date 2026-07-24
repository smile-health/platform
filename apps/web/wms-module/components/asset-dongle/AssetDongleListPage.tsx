'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import {
  FilterFormBody,
  FilterFormRoot,
  FilterSubmitButton,
  FilterFormFooter,
  FilterResetButton,
} from '@repo/ui/components/filter';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import React from 'react';
import { useTranslation } from 'react-i18next';

import AssetDongleTable from './components/AssetDongleTable';
import { useAssetDongleTable } from './hooks/useAssetDongleTable';
import { usePermission } from '@/utils/permission';

const AssetDongleListPage: React.FC = () => {
  usePermission('asset-dongle-view');
  const { t } = useTranslation(['common', 'assetDongle']);

  const {
    filter,
    handleChangePage: handleChangePageHealthcare,
    handleChangePaginate: handleChangePaginateHealthcare,
    isLoading: isLoadingHealthcare,
    assetDongleDataSource,
    pagination: paginationHealthcare,
    setPagination,
  } = useAssetDongleTable();
  return (
    <Container
      title={t('assetDongle:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Healthcare`} />

      <div className="mt-6">
        {/* Filter Form */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-flex ui-gap-2 ui-mt-5">
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                variant="outline"
                className="ui-w-48"
                text={t('common:search')}
                onClick={() => setPagination({ page: 1 })}
              ></FilterSubmitButton>
            </div>
          </FilterFormFooter>

          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <AssetDongleTable
            isLoading={isLoadingHealthcare}
            size={paginationHealthcare.paginate}
            page={paginationHealthcare.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationHealthcare.paginate}
              onChange={(paginate) => handleChangePaginateHealthcare(paginate)}
            />
            <PaginationInfo
              size={paginationHealthcare.paginate}
              currentPage={paginationHealthcare.page}
              total={assetDongleDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={assetDongleDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationHealthcare.page}
              onPageChange={(page) => handleChangePageHealthcare(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default AssetDongleListPage;
