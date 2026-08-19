'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Button } from '@repo/ui/components/button';
import {
  FilterFormBody,
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

import { usePermission } from '@/utils/permission';
import { getUserStorage } from '@/utils/storage/user';
import { loggedAsAdmin } from '../../utils/getUserRole';
import PartnershipVehicleTable from './components/PartnershipVehicleTable';
import { usePartnershipVehicleTable } from './hooks/usePartnershipVehicleTable';
import Export from '@repo/ui/components/icons/Export';
import { useDownloadVehice } from './hooks/useDownloadVehicle';

const PartnershipVehicleListPage: React.FC = () => {
  usePermission('transport-vehicle-view');
  const { t } = useTranslation(['common', 'partnershipVehicle']);
  const route = useWmsRouter();
  const user = getUserStorage();

  const {
    filter,
    handleChangePage: handleChangePagePartnershipVehicle,
    handleChangePaginate: handleChangePaginatePartnershipVehicle,
    isLoading: isLoadingPartnershipVehicle,
    partnershipVehicleDataSource,
    pagination: paginationPartnershipVehicle,
    setPagination,
  } = usePartnershipVehicleTable();

  const { downloadVehice, isLoading } = useDownloadVehice();

  const handleExport = () => {
    const { search, healthcareFacilityId } = filter.query;
    downloadVehice({
      healthcareFacilityId: healthcareFacilityId?.value ?? '',
      search: search ?? '',
    });
  };

  return (
    <Container
      title={t('partnershipVehicle:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | PartnershipVehicle vehicle`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('partnershipVehicle:list.list')}
          </h5>
          {user?.providerType && !loggedAsAdmin() && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() =>
                route.push('/partnership-vehicle/create')
              }
            >
              {t('partnershipVehicle:list.button.add')}
            </Button>
          )}
        </div>
        {/* filter */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-flex ui-gap-2 ui-items-center">
            {filter.renderField()}
            <div className="ui-flex ui-gap-2 ui-mt-5">
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
          </FilterFormBody>

          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <PartnershipVehicleTable
            isLoading={isLoadingPartnershipVehicle}
            size={paginationPartnershipVehicle.paginate}
            page={paginationPartnershipVehicle.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationPartnershipVehicle.paginate}
              onChange={(paginate) =>
                handleChangePaginatePartnershipVehicle(paginate)
              }
              perPagesOptions={partnershipVehicleDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationPartnershipVehicle.paginate}
              currentPage={paginationPartnershipVehicle.page}
              total={partnershipVehicleDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={
                partnershipVehicleDataSource?.data?.pagination?.pages ?? 0
              }
              currentPage={paginationPartnershipVehicle.page}
              onPageChange={(page) => handleChangePagePartnershipVehicle(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default PartnershipVehicleListPage;
