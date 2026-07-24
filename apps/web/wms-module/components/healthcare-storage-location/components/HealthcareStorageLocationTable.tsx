import { CommonType } from '@/types/common';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';

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
import { columnsHealthcareStorageLocation } from '../constants/table';
import { useHealthcareStorageLocationTable } from '../hooks/useHealthcareStorageLocationTable';

type HealthcareStorageLocationTableProps = CommonType & {
  size?: number;
  page?: number;
};

export default function HealthcareStorageLocationTable({
  size = 10,
  page = 1,
}: HealthcareStorageLocationTableProps) {
  const { t } = useTranslation(['common', 'healthcareStorageLocation']);

  const {
    handleChangePage,
    handleChangePaginate,
    isLoading,
    healthcareStorageLocationDataSource,
    pagination,
    filter,
    setPagination,
  } = useHealthcareStorageLocationTable();

  return (
    <div>
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
        <DataTable
          data={healthcareStorageLocationDataSource?.data.data}
          columns={columnsHealthcareStorageLocation(t, {
            page: page ?? 1,
            size: size ?? 10,
          })}
          isLoading={isLoading}
        />

        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={(paginate) => handleChangePaginate(paginate)}
            perPagesOptions={
              healthcareStorageLocationDataSource?.list_pagination
            }
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={
              healthcareStorageLocationDataSource?.data?.pagination?.total ?? 0
            }
          />
          <Pagination
            totalPages={
              healthcareStorageLocationDataSource?.data?.pagination?.pages ?? 0
            }
            currentPage={pagination.page}
            onPageChange={(page) => handleChangePage(page)}
          />
        </PaginationContainer>
      </div>
    </div>
  );
}
