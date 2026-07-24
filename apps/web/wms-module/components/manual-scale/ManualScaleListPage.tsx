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
import { DataTable } from '@repo/ui/components/data-table';
import ManualRequestApproval from './components/ManualRequestApproval';
import { useManualScaleTable } from './hooks/useManualScaleTable';
import TooltipModal from '@/components/TooltipModal';
import { TManualScale } from '@/types/manual-scale';

const renderManualApprovalCell = ({
  row,
}: {
  row: { original: TManualScale };
}) => {
  return <ManualRequestApproval item={row.original} />;
};

const ManualScaleListPage: React.FC = () => {
  usePermission('manual-scale-view');
  const { t } = useTranslation(['common', 'manualScale']);

  const [openInformation, setOpenInformation] = React.useState(false);

  const {
    filter,
    handleChangePage,
    handleChangePaginate,
    isLoading,
    manualScaleDataSource,
    pagination,
    setPagination,
  } = useManualScaleTable();

  return (
    <Container
      title={t('manualScale:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | ManualScale`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('manualScale:information.title')}
        description={t('manualScale:information.description')}
      />
      <div className="mt-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid ui-grid-cols-4 ui-gap-4 ">
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
          <DataTable
            data={manualScaleDataSource?.data.data}
            withHeader={false}
            isLoading={isLoading}
            columns={[
              {
                header: '',
                accessorKey: 'type',
                meta: {
                  cellClassName: '!ui-p-0',
                },
                cell: renderManualApprovalCell,
              },
            ]}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={handleChangePaginate}
              perPagesOptions={manualScaleDataSource?.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={manualScaleDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={manualScaleDataSource?.data?.pagination?.pages ?? 0}
              currentPage={pagination.page}
              onPageChange={handleChangePage}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default ManualScaleListPage;
