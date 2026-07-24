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
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { loggedAsAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import BudgetSourceTable from './components/BudgetSourceTable';
import { useBudgetSourceTable } from './hooks/useBudgetSourceTable';

const BudgetSourceListPage: React.FC = () => {
  usePermission('budget-source-view');
  const { t, i18n } = useTranslation(['common', 'budgetSource']);
  const locale = i18n.language;
  const route = useRouter();

  const {
    handleChangePage,
    handleChangePaginate,
    isLoading,
    budgetSourceDataSource,
    pagination,
    filter,
    setPagination,
  } = useBudgetSourceTable();

  return (
    <Container
      title={t('budgetSource:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | BudgetSource`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('budgetSource:list.list')}
          </h5>
          {!loggedAsAdmin() && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() => route.push(`/${locale}/budget-source/create`)}
            >
              {t('budgetSource:list.button.add')}
            </Button>
          )}
        </div>

        {/* Filter Form */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-space-x-3 flex ui-items-center">
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
          <BudgetSourceTable
            budgetSourceData={budgetSourceDataSource?.data.data}
            isLoading={isLoading}
            size={pagination.paginate}
            page={pagination.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={(paginate) => handleChangePaginate(paginate)}
              perPagesOptions={budgetSourceDataSource?.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={budgetSourceDataSource?.data.pagination.total}
            />
            <Pagination
              totalPages={budgetSourceDataSource?.data.pagination.pages ?? 0}
              currentPage={pagination.page}
              onPageChange={(page) => handleChangePage(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default BudgetSourceListPage;
