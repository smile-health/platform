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
import Export from '@repo/ui/components/icons/Export';
import LogbookTable from './components/LogbookTable';
import { useDownloadLogbook } from './hooks/useDownloadLogbook';
import { useLogbookTable } from './hooks/useLogbookTable';

const LogbookListPage: React.FC = () => {
  usePermission('logbook-view');
  const { t } = useTranslation(['common', 'logbook']);

  const {
    filter,
    handleChangePage: handleChangePageLogbook,
    handleChangePaginate: handleChangePaginateLogbook,
    isLoading: isLoadingLogbook,
    logbookDataSource,
    pagination: paginationLogbook,
    setPagination,
  } = useLogbookTable();

  const { downloadLogbook, isLoading } = useDownloadLogbook();

  const handleExport = () => {
    const { dateRange, healthcareId, provinceId, cityId } = filter.query;
    downloadLogbook({
      startDate: dateRange?.start ?? '',
      endDate: dateRange?.end ?? '',
      healthcareFacilityId: healthcareId?.value ?? '',
      provinceId: provinceId?.value ?? '',
      regencyId: cityId?.value ?? '',
    });
  };

  return (
    <Container
      title={t('logbook:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | Logbook`} />

      <div className="mt-6">
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
                onClick={() => handleExport()}
                loading={isLoading}
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
          <LogbookTable
            isLoading={isLoadingLogbook}
            size={paginationLogbook.paginate}
            page={paginationLogbook.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationLogbook.paginate}
              onChange={(paginate) => handleChangePaginateLogbook(paginate)}
              perPagesOptions={logbookDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationLogbook.paginate}
              currentPage={paginationLogbook.page}
              total={logbookDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={logbookDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationLogbook.page}
              onPageChange={(page) => handleChangePageLogbook(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default LogbookListPage;
