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
import HomeSuperadminTable from './components/table/HomeSuperadminTable';
import { useHomeSuperadminTable } from './hooks/useHomeSuperadminTable';

export default function HomeSuperAdmin() {
  const { t } = useTranslation(['common', 'home']);

  const {
    filter,
    handleChangePage,
    handleChangePaginate,
    pagination,
    setPagination,
    summaryWasteHierarchy,
  } = useHomeSuperadminTable();

  return (
    <Container title={t('home:title')} hideTabs={false} withLayout={true}>
      <Meta title={`WMS | ${t('home:title')}`} />

      <div className="ui-mt-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid ui-grid-cols-4 ui-gap-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-flex ui-gap-2 ui-mt-5">
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
      </div>

      <div className="ui-mt-5">
        <HomeSuperadminTable
          page={pagination.page}
          size={pagination.paginate}
          filter={filter}
        />

        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={(paginate) => handleChangePaginate(paginate)}
            perPagesOptions={summaryWasteHierarchy?.list_pagination}
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={summaryWasteHierarchy?.data?.pagination?.total}
          />
          <Pagination
            totalPages={summaryWasteHierarchy?.data?.pagination?.pages ?? 0}
            currentPage={pagination.page}
            onPageChange={(page) => handleChangePage(page)}
          />
        </PaginationContainer>
      </div>
    </Container>
  );
}
