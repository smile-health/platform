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
import WasteSpecificationTable from './components/WasteSpecificationTable';
import { useWasteSpecificationTable } from './hooks/useWasteSpecificationTable';
import TooltipModal from '@/components/TooltipModal';

const WasteSpecificationPageList: React.FC = () => {
  usePermission('waste-specification-view');
  const { t, i18n } = useTranslation(['common', 'wasteSpecification']);

  const locale = i18n.language;

  const route = useRouter();

  const {
    handleChangePage: handleChangePageWasteSpecification,
    handleChangePaginate: handleChangePaginateWasteSpecification,
    isLoading: isLoadingWasteSpecification,
    wasteSpecificationDataSource,
    pagination: paginationWasteSpecification,
    filter,
    setPagination,
  } = useWasteSpecificationTable();

  const [openInformation, setOpenInformation] = React.useState(false);

  return (
    <Container
      title={t('wasteSpecification:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Waste Specification`} />

      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('wasteSpecification:information.title')}
        description={t('wasteSpecification:information.description')}
      />
      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-font-bold ui-text-xl">
            {t('wasteSpecification:list.list')}
          </h5>
          {!loggedAsAdmin() && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() =>
                route.push(`/${locale}/waste-specification/create`)
              }
            >
              {t('wasteSpecification:master_waste_create')}
            </Button>
          )}
        </div>

        {/* Filter Form */}
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
          <WasteSpecificationTable
            isLoading={isLoadingWasteSpecification}
            size={paginationWasteSpecification.paginate}
            page={paginationWasteSpecification.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationWasteSpecification.paginate}
              onChange={(paginate) =>
                handleChangePaginateWasteSpecification(paginate)
              }
              perPagesOptions={wasteSpecificationDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationWasteSpecification.paginate}
              currentPage={paginationWasteSpecification.page}
              total={wasteSpecificationDataSource?.data.pagination.total}
            />
            <Pagination
              totalPages={
                wasteSpecificationDataSource?.data.pagination.pages ?? 0
              }
              currentPage={paginationWasteSpecification.page}
              onPageChange={(page) => handleChangePageWasteSpecification(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default WasteSpecificationPageList;
