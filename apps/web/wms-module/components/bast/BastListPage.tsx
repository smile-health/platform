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
import BastTable from './components/BastTable';
import { useBastTable } from './hooks/useBastTable';

const BastListPage: React.FC = () => {
  usePermission('bast-view');

  const { t } = useTranslation(['common', 'bast']);

  const {
    handleChangePage: handleChangePageBast,
    handleChangePaginate: handleChangePaginateBast,
    isLoading: isLoadingBast,
    pagination: paginationBast,
    filter,
    setPagination,
    bastDataSource,
  } = useBastTable();

  return (
    <Container title={t('bast:list.list')} hideTabs={false} withLayout={true}>
      <Meta title={`WMS | Bast`} />

      <div className="mt-6">
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
          <BastTable
            bastDataSource={bastDataSource?.data.data}
            isLoading={isLoadingBast}
            size={paginationBast.paginate}
            page={paginationBast.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationBast.paginate}
              onChange={(paginate) => handleChangePaginateBast(paginate)}
              perPagesOptions={[10, 20, 50]}
            />
            <PaginationInfo
              size={paginationBast.paginate}
              currentPage={paginationBast.page}
              total={bastDataSource?.data.pagination.total}
            />
            <Pagination
              totalPages={bastDataSource?.data.pagination.pages ?? 0}
              currentPage={paginationBast.page}
              onPageChange={(page) => handleChangePageBast(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default BastListPage;
