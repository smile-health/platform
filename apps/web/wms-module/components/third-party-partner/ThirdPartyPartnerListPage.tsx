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
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { loggedAsAdmin } from '@/utils/getUserRole';
import { usePermission } from '@/utils/permission';
import { getUserStorage } from '@/utils/storage/user';
import ThirdPartyPartnerTable from './components/ThirdPartyPartnerTable';
import { useThirdPartyPartnerTable } from './hooks/useThirdPartyPartnerTable';

const ThirdPartyPartnerListPage: React.FC = () => {
  usePermission('thirdparty-partner-view');
  const { t, i18n } = useTranslation(['common', 'thirdPartyPartner']);
  const locale = i18n.language;
  const route = useRouter();
  const user = getUserStorage();

  const {
    filter,
    handleChangePage: handleChangePageThirdPartyPartner,
    handleChangePaginate: handleChangePaginateThirdPartyPartner,
    isLoading: isLoadingThirdPartyPartner,
    partnershipDataSource,
    pagination: paginationThirdPartyPartner,
    setPagination,
  } = useThirdPartyPartnerTable();

  return (
    <Container
      title={t('thirdPartyPartner:list.list')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | ThirdPartyPartner`} />

      <div className="mt-6">
        <div className="ui-my-6 ui-flex ui-justify-end ui-items-center">
          {user?.providerType && !loggedAsAdmin() && (
            <Button
              leftIcon={<Plus className="ui-size-5" />}
              loading={false}
              disabled={false}
              onClick={() =>
                route.push(`/${locale}/third-party-partner/create`)
              }
            >
              {t('thirdPartyPartner:list.button.add')}
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
          <ThirdPartyPartnerTable
            isLoading={isLoadingThirdPartyPartner}
            size={paginationThirdPartyPartner.paginate}
            page={paginationThirdPartyPartner.page}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationThirdPartyPartner.paginate}
              onChange={(paginate) =>
                handleChangePaginateThirdPartyPartner(paginate)
              }
              perPagesOptions={partnershipDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationThirdPartyPartner.paginate}
              currentPage={paginationThirdPartyPartner.page}
              total={partnershipDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={partnershipDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationThirdPartyPartner.page}
              onPageChange={(page) => handleChangePageThirdPartyPartner(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default ThirdPartyPartnerListPage;
