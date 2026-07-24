'use client'

import { FC, useMemo } from 'react'
import { DataTable } from '#components/data-table'
import { UseFilter, useFilter } from '#components/filter'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '#components/pagination'
import { usePermission } from '#hooks/usePermission'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { CommonType } from '#types/common'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import UserFilter from './components/UserFilter'
import useUserTableTable from './hooks/useUserTable'
import userFilterFormSchema from './schemas/userFilterFormSchema'

const UserListPage: FC<CommonType> = ({ isGlobal }): JSX.Element => {
  usePermission(isGlobal ? 'user-global-view' : 'user-view')
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'user'])

  const filterSchema = useMemo<UseFilter>(
    () => userFilterFormSchema(t, isGlobal),
    [t, language]
  )

  const filter = useFilter(filterSchema)

  const {
    tableColumns,
    dataSource,
    isLoading,
    page,
    paginate,
    handleChangePage,
    handleChangePaginate,
    changeStatus,
    sorting,
    setSorting,
  } = useUserTableTable({
    isGlobal,
    filter: filter?.query,
  })

  useSetLoadingPopupStore(isLoading)

  return (
    <Container title={t('user:title.index')} hideTabs withLayout={!isGlobal}>
      <Meta title={generateMetaTitle(t('user:title.user'), isGlobal)} />
      <ModalConfirmation
        key={changeStatus?.state?.id}
        open={changeStatus?.state?.show}
        setOpen={changeStatus?.reset}
        type={changeStatus?.state?.status ? 'delete' : 'update'}
        description={
          changeStatus?.state?.status
            ? t('user:confirmation.deactivate.question')
            : t('user:confirmation.activate.question')
        }
        subDescription={
          changeStatus?.state?.status
            ? t('user:confirmation.deactivate.description')
            : ''
        }
        onSubmit={changeStatus?.submit}
      />

      <div className="ui-space-y-4 mt-6">
        <UserFilter
          filter={filter}
          isGlobal={isGlobal}
          handleChangePage={handleChangePage}
        />
        <DataTable
          isLoading={isLoading}
          data={dataSource?.data}
          columns={tableColumns}
          sorting={sorting}
          setSorting={setSorting}
        />
        <PaginationContainer>
          <PaginationSelectLimit
            size={paginate}
            onChange={handleChangePaginate}
            perPagesOptions={dataSource?.list_pagination}
          />
          <PaginationInfo
            size={paginate}
            currentPage={page}
            total={dataSource?.total_item}
          />
          <Pagination
            totalPages={dataSource?.total_page ?? 1}
            currentPage={page}
            onPageChange={handleChangePage}
          />
        </PaginationContainer>
      </div>
    </Container>
  )
}

export default UserListPage
