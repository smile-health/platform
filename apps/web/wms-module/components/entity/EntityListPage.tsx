'use client';

import {
  FilterFormBody,
  FilterFormFooter,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '@repo/ui/components/filter';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Meta from '../layouts/Meta';
import Container from '../layouts/PageContainer';

import { usePermission } from '@/utils/permission';
import EntityTable from './components/EntityTable';
import { useEntityTable } from './hooks/useEntityTable';
import TooltipModal from '@/components/TooltipModal';

const EntityListPage: React.FC = () => {
  usePermission('entity-view');
  const { t } = useTranslation(['common', 'entityWMS']);

  const [openInformation, setOpenInformation] = useState(false);

  const {
    handleChangePage: handleChangePageEntity,
    handleChangePaginate: handleChangePaginateEntity,
    isLoading: isLoadingEntity,
    entityDataSource,
    pagination: paginationEntity,
    filter,
    setPagination,
  } = useEntityTable();

  return (
    <Container
      title={t('entityWMS:list.list')}
      hideTabs={false}
      withLayout={true}
      showInformation
      onClickInformation={() => setOpenInformation(true)}
    >
      <Meta title={`WMS | Entity`} />
      <TooltipModal
        open={openInformation}
        setOpen={setOpenInformation}
        title={t('entityWMS:information.title')}
        description={t('entityWMS:information.description')}
      />
      <div className="mt-6">
        <FilterFormRoot onSubmit={filter.handleSubmit}>
          <FilterFormBody className="ui-grid-cols-4">
            {filter.renderField()}
          </FilterFormBody>
          <FilterFormFooter>
            <div className="ui-flex ui-gap-2" />
            <div className="ui-flex ui-gap-2">
              <span className="ui-h-full ui-w-px ui-bg-neutral-300" />
              <FilterResetButton variant="subtle" onClick={filter.reset} />
              <FilterSubmitButton
                variant="outline"
                className="ui-w-[220px]"
                text={t('common:search')}
                onClick={() => setPagination({ page: 1 })}
              ></FilterSubmitButton>
            </div>
          </FilterFormFooter>

          {filter.renderActiveFilter()}
        </FilterFormRoot>

        <div className="ui-space-y-6 ui-my-5 ui-rounded">
          <EntityTable
            isLoading={isLoadingEntity}
            size={paginationEntity.paginate}
            page={paginationEntity.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationEntity.paginate}
              onChange={(paginate) => handleChangePaginateEntity(paginate)}
              perPagesOptions={entityDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationEntity.paginate}
              currentPage={paginationEntity.page}
              total={entityDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={entityDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationEntity.page}
              onPageChange={(page) => handleChangePageEntity(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default EntityListPage;
