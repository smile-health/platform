'use client'

import { DataTable } from '#components/data-table'
import {
  FilterFormBody,
  FilterFormRoot,
  FilterResetButton,
  FilterSubmitButton,
} from '#components/filter'
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
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { useProtocolList } from './hooks/useProtocolList'
import { columnsListProtocol } from './protocol.constant'

export default function ProtocolListPage(): JSX.Element {
  usePermission('protocol-view')
  const { t } = useTranslation(['common', 'protocol'])
  const router = useSmileRouter()

  const {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    filter,
    showModal,
    setShowModal,
    selectedProtocolData,
    setSelectedProtocolData,
    changeStatusProtocol,
  } = useProtocolList()

  useSetLoadingPopupStore(isLoading)

  return (
    <>
      <ModalConfirmation
        open={showModal}
        description={
          selectedProtocolData?.status === 0
            ? t(
                'protocol:detail.material_activity.relation.confirmation.activate.description'
              )
            : t(
                'protocol:detail.material_activity.relation.confirmation.deactivate.description'
              )
        }
        setOpen={setShowModal}
        onSubmit={changeStatusProtocol}
      />

      <Container
        title={t('protocol:title.settings')}
        hideTabs={false}
        withLayout={true}
      >
        <Meta title={`Smile | ${t('protocol:title.settings')}`} />

        <div className="mt-6 space-y-6">
          <FilterFormRoot onSubmit={filter.handleSubmit}>
            <FilterFormBody className="ui-flex ui-items-end ui-gap-4">
              <div className="ui-flex-1">{filter.renderField()}</div>
              <div className="ui-space-x-3 ui-flex ui-mt-5">
                <div className="ui-flex ui-gap-2">
                  <FilterResetButton variant="subtle" onClick={filter.reset} />
                </div>
                <FilterSubmitButton
                  onClick={() => setPagination({ page: 1 })}
                  className="ui-w-48"
                  variant="outline"
                />
              </div>
            </FilterFormBody>

            {filter.renderActiveFilter()}
          </FilterFormRoot>
          <DataTable
            data={data?.data}
            isLoading={isLoading}
            columns={columnsListProtocol(t, {
              page: pagination.page,
              size: pagination.paginate,
              setLink: router.getAsLink,
              onChangeStatus: (protocol) => {
                setShowModal(true)
                setSelectedProtocolData(protocol)
              },
            })}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={pagination.paginate}
              onChange={handleChangeLimit}
              perPagesOptions={data?.list_pagination}
            />
            <PaginationInfo
              size={pagination.paginate}
              currentPage={pagination.page}
              total={data?.total_item}
            />
            <Pagination
              totalPages={data?.total_page ?? 1}
              currentPage={pagination.page}
              onPageChange={(page) => setPagination({ page })}
            />
          </PaginationContainer>
        </div>
      </Container>
    </>
  )
}
