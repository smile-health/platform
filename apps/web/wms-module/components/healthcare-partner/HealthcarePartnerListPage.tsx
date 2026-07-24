'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
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

import { usePermission } from '@/utils/permission';
import HealthcarePartnerTable from './components/HealthcarePartnerTable';
import { useHealthcarePartnerTable } from './hooks/useHealthcarePartnerTable';

const HealthcarePartnerListPage: React.FC = () => {
  usePermission('healthcare-partner-view');
  const { t } = useTranslation(['common', 'healthcarePartner']);

  const {
    filter,
    handleChangePage: handleChangePageHealthcarePartner,
    handleChangePaginate: handleChangePaginateHealthcarePartner,
    isLoading: isLoadingHealthcarePartner,
    partnershipDataSource,
    pagination: paginationHealthcarePartner,
    setPagination,
  } = useHealthcarePartnerTable();

  return (
    <Container
      title={t('healthcarePartner:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | HealthcarePartner`} />
      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-items-center"></div>
        {/* filter */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
            <div className="ui-flex ui-gap-2 ui-mt-5">
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
          <HealthcarePartnerTable
            isLoading={isLoadingHealthcarePartner}
            size={paginationHealthcarePartner.paginate}
            page={paginationHealthcarePartner.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationHealthcarePartner.paginate}
              onChange={(paginate) =>
                handleChangePaginateHealthcarePartner(paginate)
              }
              perPagesOptions={partnershipDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationHealthcarePartner.paginate}
              currentPage={paginationHealthcarePartner.page}
              total={partnershipDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={partnershipDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationHealthcarePartner.page}
              onPageChange={(page) => handleChangePageHealthcarePartner(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default HealthcarePartnerListPage;
