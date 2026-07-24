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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isSuperAdmin, loggedAsAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import TreatmentLocationTable from './components/TreatmentLocationTable';
import { useTreatmentLocationTable } from './hooks/useTreatmentLocationTable';
import TooltipModal from '@/components/TooltipModal';

const TreatmentLocationListPage: React.FC = () => {
  usePermission('treatment-location-view');
  const { t, i18n } = useTranslation(['common', 'treatmentLocation']);
  const locale = i18n.language;
  const route = useRouter();

  const [openInformation, setOpenInformation] = useState(false);

  const {
    handleChangePage,
    handleChangePaginate,
    isLoading,
    treatmentLocationDataSource,
    pagination,
    filter,
    setPagination,
  } = useTreatmentLocationTable();

  return (
    <Container
      title={t('treatmentLocation:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Treatment Location`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('treatmentLocation:information.title')}
        description={t('treatmentLocation:information.description')}
      />
      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('treatmentLocation:list.list')}
          </h5>
          {!(loggedAsAdmin() || isSuperAdmin()) && (
            <div className="ui-flex ui-gap-2">
              <Button
                leftIcon={<Plus className="ui-size-5" />}
                loading={false}
                disabled={false}
                onClick={() =>
                  route.push(`/${locale}/treatment-location/create`)
                }
              >
                {t('treatmentLocation:list.button.add')}
              </Button>
            </div>
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
          <TreatmentLocationTable
            isLoading={isLoading}
            size={pagination.paginate}
            page={pagination.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={(paginate) => handleChangePaginate(paginate)}
              perPagesOptions={treatmentLocationDataSource?.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={treatmentLocationDataSource?.data?.pagination?.total ?? 0}
            />
            <Pagination
              totalPages={
                treatmentLocationDataSource?.data?.pagination?.pages ?? 0
              }
              currentPage={pagination.page}
              onPageChange={(page) => handleChangePage(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default TreatmentLocationListPage;
