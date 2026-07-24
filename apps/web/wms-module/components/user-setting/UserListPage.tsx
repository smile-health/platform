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
import { useTranslation } from 'react-i18next';
import Meta from '../layouts/Meta';
import Container from '../layouts/PageContainer';

import { usePermission } from '@/utils/permission';
import UserTable from './components/UserTable';
import { useUserTable } from './hooks/useUserTable';

const UserListPage: React.FC = () => {
  usePermission('user-setting-view');
  const { t } = useTranslation(['common', 'userSetting']);

  const {
    handleChangePage: handleChangePageUser,
    handleChangePaginate: handleChangePaginateUser,
    isLoading: isLoadingUser,
    userDataSource,
    pagination: paginationUser,
    filter,
    setPagination,
  } = useUserTable();

  return (
    <Container
      title={t('userSetting:title.index')}
      hideTabs={false}
      withLayout={true}
    >
      <Meta title={`WMS | User`} />
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
          <UserTable
            isLoading={isLoadingUser}
            size={paginationUser.paginate}
            page={paginationUser.page}
          />

          <PaginationContainer>
            <PaginationSelectLimit
              size={paginationUser.paginate}
              onChange={(paginate) => handleChangePaginateUser(paginate)}
              perPagesOptions={userDataSource?.list_pagination}
            />
            <PaginationInfo
              size={paginationUser.paginate}
              currentPage={paginationUser.page}
              total={userDataSource?.data?.pagination?.total}
            />
            <Pagination
              totalPages={userDataSource?.data?.pagination?.pages ?? 0}
              currentPage={paginationUser.page}
              onPageChange={(page) => handleChangePageUser(page)}
            />
          </PaginationContainer>
        </div>
      </div>
    </Container>
  );
};

export default UserListPage;
