'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormFooter,
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

import { loggedAsAdmin } from '@/utils/getUserRole';
import HealthcareHFTable from './components/HealthcareHFTable';
import { useHealthcareHFTable } from './hooks/useHealthcareHFTable';

const HealthcareHFListPage: React.FC = () => {
  const { t } = useTranslation(['common', 'healthCare']);
  const route = useWmsRouter();

  const {
    filter,
    handleChangePage: handleChangePageHealthcare,
    handleChangePaginate: handleChangePaginateHealthcare,
    isLoading: isLoadingHealthcare,
    healthcareDataSource,
    pagination: paginationHealthcare,
    setPagination,
  } = useHealthcareHFTable();

  return (
    <Container
      title={t('healthCare:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Healthcare`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('healthCare:list.list')}
          </h5>
          {!loggedAsAdmin() && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() => route.push('/healthcare/create')}
            >
              {t('healthCare:list.button.add')}
            </Button>
          )}
        </div>
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-space-x-3 flex">
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
          <HealthcareHFTable
            isLoading={isLoadingHealthcare}
            size={paginationHealthcare.paginate}
            page={paginationHealthcare.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationHealthcare.paginate}
              onChange={(paginate) => handleChangePaginateHealthcare(paginate)}
              perPagesOptions={healthcareDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationHealthcare.paginate}
              currentPage={paginationHealthcare.page}
              total={healthcareDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={healthcareDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationHealthcare.page}
              onPageChange={(page) => handleChangePageHealthcare(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default HealthcareHFListPage;
