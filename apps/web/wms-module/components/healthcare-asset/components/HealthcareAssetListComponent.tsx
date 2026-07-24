'use client';

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
import React from 'react';
import { useTranslation } from 'react-i18next';

import HealthcareTable from './HealthcareAssetTable';
import { useHealthcareAssetTable } from '../hooks/useHealthcareAssetTable';

const HealthcareAssetListComponent = ({
  fromDetailAsset = false,
}: {
  fromDetailAsset: boolean;
}) => {
  const { t } = useTranslation(['common', 'healthcareAsset']);

  const {
    filter,
    handleChangePage: handleChangePageHealthcare,
    handleChangePaginate: handleChangePaginateHealthcare,
    isLoading: isLoadingHealthcare,
    healthcareAssetDataSource,
    pagination: paginationHealthcare,
    setPagination,
  } = useHealthcareAssetTable(
    fromDetailAsset
      ? { asset_type_ids: '40' }
      : { asset_type_ids: '43,42,41,40' }
  );
  return (
    <div className="mt-6">
      <FilterFormRoot onSubmit={filter.handleSubmit}>
        <FilterFormBody className="ui-grid ui-grid-cols-3 ui-gap-4">
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

      <div className="ui-space-y-6 ui-my-5 ui-rounded">
        <HealthcareTable
          isLoading={isLoadingHealthcare}
          size={paginationHealthcare.paginate}
          page={paginationHealthcare.page}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={paginationHealthcare.paginate}
            onChange={(paginate) => handleChangePaginateHealthcare(paginate)}
            perPagesOptions={healthcareAssetDataSource?.list_pagination}
          />
          <PaginationInfo
            size={paginationHealthcare.paginate}
            currentPage={paginationHealthcare.page}
            total={healthcareAssetDataSource?.total_item}
          />
          <Pagination
            totalPages={healthcareAssetDataSource?.total_page ?? 0}
            currentPage={paginationHealthcare.page}
            onPageChange={(page) => handleChangePageHealthcare(page)}
          />
        </PaginationContainer>
      </div>
    </div>
  );
};

export default HealthcareAssetListComponent;
