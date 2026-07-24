import { Button } from "#components/button"
import { DataTable } from "#components/data-table"
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit
} from "#components/pagination"

import AppLayout from "#components/layouts/AppLayout/AppLayout"
import Meta from "#components/layouts/Meta"
import { ENTITY_TYPE } from "#constants/entity"
import { usePermission } from "#hooks/usePermission"

import { useAnnualPlanningProcessListPage } from "./hooks/useAnnualPlanningProcessListPage"
import Plus from "#components/icons/Plus"
import EmptyFilter from "#components/icons/EmptyFilter"
import { ModalConfirmation } from "#components/modules/ModalConfirmation"
import AnnualPlanningProcessListMinMaxProvince from "./components/AnnualPlanningProcessListMinMaxProvince"
import { AnnualPlanningProcessListContext } from "./context/ContextProvider"
import { useAnnualPlanningEnabled } from "#hooks/useAnnualPlanningEnabled"

const AnnualPlanningProcessListPage: React.FC = () => {
  usePermission('annual-planning-process-view')
  const {
    t,
    pagination,
    isFetchingDistrict,
    isFetchingProvince,
    datasourceDistrict,
    datasourceProvince,
    metaPagination,
    userTag,
    setPagination,
    handleCreate,
    emptyMessage,
    memoizedColumnsProvince,
    memoizedColumnsDistrict,
    provinceName,
    activateMinMaxProvince,
    setActivateMinMaxProvince,
    mutateActivateMinMaxProvince,
    contextValue,
  } = useAnnualPlanningProcessListPage()
  const { isDisabledAnnual } = useAnnualPlanningEnabled()
  if (isDisabledAnnual) return <AppLayout title=""><div /></AppLayout>

  const shouldShowSectionProvince = userTag === ENTITY_TYPE.PROVINSI || userTag === ENTITY_TYPE.PRIMARY_VENDOR

  return (
    <AnnualPlanningProcessListContext.Provider
      value={contextValue}
    >
      <AppLayout title={t('annualPlanningProcess:title')}>
        <Meta title={t('annualPlanningProcess:meta')} />

        <ModalConfirmation
          description={t('annualPlanningProcess:list.min_max.toast.description', { province: provinceName })}
          open={activateMinMaxProvince}
          setOpen={setActivateMinMaxProvince}
          onSubmit={mutateActivateMinMaxProvince}
        />

        <div className="ui-space-y-6">
          <div className="ui-flex ui-justify-between ui-items-center">
            <h5 className="ui-font-bold ui-text-xl">
              {t('annualPlanningProcess:list.title')}
            </h5>
            {userTag === ENTITY_TYPE.KOTA && (
              <Button
                id="create-annual-planning-process"
                data-testid="create-annual-planning-process"
                type="button"
                onClick={handleCreate}
                className="ui-min-w-40"
                leftIcon={<Plus className="ui-size-5" />}
              >
                {t('annualPlanningProcess:list.create')}
              </Button>
            )}
          </div>
          {/* section filter and min-max activation for province user */}
          {shouldShowSectionProvince && <AnnualPlanningProcessListMinMaxProvince />}

          {shouldShowSectionProvince && (
            <DataTable
              data={datasourceProvince?.data.annual_needs || []}
              columns={memoizedColumnsProvince}
              isLoading={isFetchingProvince}
              emptyTitle={emptyMessage?.title}
              emptyDescription={emptyMessage?.description}
              emptyIcon={<EmptyFilter className="ui-size-6 ui-text-[#52525B]" />}
            />
          )}

          {userTag === ENTITY_TYPE.KOTA && (
            <DataTable
              data={datasourceDistrict?.data}
              columns={memoizedColumnsDistrict}
              isLoading={isFetchingDistrict}
              emptyTitle={emptyMessage?.title}
              emptyDescription={emptyMessage?.description}
            />
          )}

          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={(paginate) => setPagination({ paginate })}
              perPagesOptions={metaPagination.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={metaPagination.total_item}
            />
            <Pagination
              totalPages={metaPagination.total_page || 0}
              currentPage={pagination.page}
              onPageChange={(page) => setPagination({ page })}
            />
          </PaginationContainer>
        </div>
      </AppLayout>
    </AnnualPlanningProcessListContext.Provider>
  )
}

export default AnnualPlanningProcessListPage