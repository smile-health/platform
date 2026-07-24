import { DataTable } from '@repo/ui/components/data-table';
import { InputSearch } from '@repo/ui/components/input';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { useTranslation } from 'react-i18next';
import { columnsEntityDetailsUsers } from '../../constants/table';
import { useEntityDetailUsers } from '../../hooks/useEntityDetailUsers';

const EntityDetailUser: React.FC = () => {
  const { t } = useTranslation(['common', 'entityWMS', 'user']);

  const {
    handleChangePage: handleChangePageEntityDetailUsers,
    handleChangePaginate: handleChangePaginateEntityDetailUsers,
    isLoading,
    entityDetailUsersDataSource,
    pagination: paginationEntityDetailUsers,
    filter,
    sorting,
    setSorting,
  } = useEntityDetailUsers();

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold">{t('entityWMS:detail.users.title')}</h5>
        <div className="ui-w-[378px]">
          <InputSearch
            id="input-search-entity-user"
            placeholder={t('entityWMS:detail.users.placeholder')}
            onChange={(e) => {
              const timer = setTimeout(() => {
                clearTimeout(timer);
                filter.handleSubmit();
              }, 1000);
              filter.setValue('keyword', e.target.value);
            }}
          />
        </div>
      </div>

      <DataTable
        data={entityDetailUsersDataSource?.data}
        columns={columnsEntityDetailsUsers(t, {
          page: paginationEntityDetailUsers.page,
          paginate: paginationEntityDetailUsers.paginate,
        })}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
        className="ui-overflow-x-auto"
      />

      <PaginationContainer>
        <PaginationSelectLimit
          size={paginationEntityDetailUsers.paginate}
          onChange={handleChangePaginateEntityDetailUsers}
          perPagesOptions={entityDetailUsersDataSource?.list_pagination}
        />
        <PaginationInfo
          size={paginationEntityDetailUsers.paginate}
          currentPage={paginationEntityDetailUsers.page}
          total={entityDetailUsersDataSource?.total_item}
        />
        <Pagination
          totalPages={entityDetailUsersDataSource?.total_page ?? 0}
          currentPage={paginationEntityDetailUsers.page}
          onPageChange={handleChangePageEntityDetailUsers}
        />
      </PaginationContainer>
    </div>
  );
};

export default EntityDetailUser;
