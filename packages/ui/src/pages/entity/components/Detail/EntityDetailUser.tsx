import { DataTable } from "#components/data-table"
import { InputSearch } from "#components/input"
import { Pagination, PaginationContainer, PaginationInfo, PaginationSelectLimit } from "#components/pagination"
import { useDebounce } from "#hooks/useDebounce"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { columnsDetailUserGlobal, columnsDetailUserPrograms } from "#pages/entity/constants/table"
import { listEntityUser } from "#services/entity"
import { listUsers } from "#services/user"
import { CommonType } from "#types/common"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const EntityDetailUser: React.FC<CommonType> = ({ isGlobal }) => {
  const { t } = useTranslation(['common', 'entity', 'user'])
  const params = useParams()
  const id = params?.id
  const [filter, setFilter] = useState<{
    page: number; paginate: number; keyword?: string
  }>({
    page: 1, paginate: 10,
  })
  const debounceKeyword = useDebounce(filter.keyword, 500)

  const filterKeys = [filter.page, filter.paginate, debounceKeyword]

  const userGlobal = useQuery({
    queryKey: isGlobal ? ['usersGlobal', ...filterKeys] : ['usersGlobal'],
    queryFn: () => listUsers({
      ...filter,
      ...id && { entity_id: id as string },
    }),
    enabled: !!id && !!isGlobal
  })

  const userWorkspace = useQuery({
    queryKey: !isGlobal ? ['usersWorkspace', ...filterKeys] : ['usersWorkspace'],
    queryFn: () => listEntityUser(id as string, {
      ...filter,
    }),
    enabled: !!id && !isGlobal
  })

  const onSizeChange = (paginate: number) => setFilter(prev => ({ ...prev, paginate, page: 1 }))
  const onPageChange = (page: number) => setFilter(prev => ({ ...prev, page }))

  const isLoadingPopup = userGlobal.isFetching || userWorkspace.isFetching
  useSetLoadingPopupStore(isLoadingPopup)

  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-gray-300 ui-rounded ui-space-y-4">
      <div className="ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold">{t('entity:detail.users.title')}</h5>
        <div className="ui-w-[378px]">
          <InputSearch
            id="input-search-entity-user"
            placeholder={t('entity:detail.users.placeholder')}
            defaultValue={filter.keyword}
            onChange={e => setFilter(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
          />
        </div>
      </div>
      {isGlobal ? (
        <DataTable
          data={userGlobal.data?.data}
          columns={columnsDetailUserGlobal(t, { page: filter.page, paginate: filter.paginate })}
          isLoading={isGlobal ? userGlobal.isFetching : userWorkspace.isFetching}
        />
      ) : (
        <DataTable
          data={userWorkspace.data?.data}
          columns={columnsDetailUserPrograms(t, { page: filter.page, paginate: filter.paginate })}
          isLoading={isGlobal ? userGlobal.isFetching : userWorkspace.isFetching}
        />
      )}
      {(!!userGlobal.data?.total_item || !!userWorkspace.data?.total_item) && (
        <PaginationContainer>
          <PaginationSelectLimit size={filter.paginate} onChange={onSizeChange} perPagesOptions={isGlobal ? userGlobal.data?.list_pagination : userWorkspace.data?.list_pagination} />
          <PaginationInfo
            size={filter.paginate}
            currentPage={filter.page}
            total={isGlobal ? userGlobal.data?.total_item : userWorkspace.data?.total_item}
          />
          <Pagination
            totalPages={isGlobal ? userGlobal.data?.total_page || 0 : userWorkspace.data?.total_page || 0}
            currentPage={filter.page}
            onPageChange={onPageChange}
          />
        </PaginationContainer>
      )}
    </div>
  )
}

export default EntityDetailUser
