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

import { isFacilityAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import PartnershipTable from './components/PartnershipTable';
import { usePartnershipTable } from './hooks/usePartnershipTable';
import TooltipModal from '@/components/TooltipModal';

const PartnershipListPage: React.FC = () => {
  usePermission('partnership-view');
  const { t, i18n } = useTranslation(['common', 'partnership']);
  const locale = i18n.language;
  const route = useRouter();

  const [openInformation, setOpenInformation] = useState(false);

  const {
    filter,
    handleChangePage: handleChangePagePartnership,
    handleChangePaginate: handleChangePaginatePartnership,
    isLoading: isLoadingPartnership,
    partnershipDataSource,
    pagination: paginationPartnership,
    setPagination,
  } = usePartnershipTable();

  return (
    <Container
      title={t('partnership:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Partnership`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('partnership:information.title')}
        description={t('partnership:information.description')}
      />
      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('partnership:list.list')}
          </h5>
          {isFacilityAdmin() && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() => route.push(`/${locale}/partnership/create`)}
            >
              {t('partnership:list.button.add')}
            </Button>
          )}
        </div>
        {/* filter */}
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid ui-grid-cols-3 ui-gap-4">
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
          <PartnershipTable
            isLoading={isLoadingPartnership}
            size={paginationPartnership.paginate}
            page={paginationPartnership.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationPartnership.paginate}
              onChange={(paginate) => handleChangePaginatePartnership(paginate)}
              perPagesOptions={partnershipDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationPartnership.paginate}
              currentPage={paginationPartnership.page}
              total={partnershipDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={partnershipDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationPartnership.page}
              onPageChange={(page) => handleChangePagePartnership(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default PartnershipListPage;
