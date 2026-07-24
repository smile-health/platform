'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { useTranslation } from 'react-i18next';

import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import Export from '@repo/ui/components/icons/Export';
import Reload from '@repo/ui/components/icons/Reload';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { useTransactionTable } from '../transaction/hooks/useTransactionTable';
import HomeHFTable from './components/table/HomeHFTable';

export default function HomeHFAdmin() {
  const { t } = useTranslation(['common', 'home', 'transaction']);

  const {
    filter,
    handleChangePage: handleChangePageTransaction,
    handleChangePaginate: handleChangePaginateTransaction,
    isLoading: isLoadingTransaction,
    transactionDataSource,
    pagination: paginationTransaction,
    setPagination,
  } = useTransactionTable();

  return (
    <Container title={t('home:title')} hideTabs={false} withLayout={true}>
      <Meta title={`WMS | ${t('home:title')}`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-semibold ui-text-lg">
            {t('home:home_hf.title')}
          </h5>
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
                leftIcon={<Export className="ui-size-5" />}
              >
                {t('common:export')}
              </Button>
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
          <HomeHFTable
            transactionDataSource={transactionDataSource?.data.data}
            isLoading={isLoadingTransaction}
            size={paginationTransaction.paginate}
            page={paginationTransaction.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationTransaction.paginate}
              onChange={(paginate) => handleChangePaginateTransaction(paginate)}
              perPagesOptions={transactionDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationTransaction.paginate}
              currentPage={paginationTransaction.page}
              total={transactionDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={transactionDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationTransaction.page}
              onPageChange={(page) => handleChangePageTransaction(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
}
