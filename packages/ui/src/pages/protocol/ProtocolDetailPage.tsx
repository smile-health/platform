'use client'

import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { FilterFormBody, FilterFormRoot } from '#components/filter'
import Plus from '#components/icons/Plus'
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
import { useTranslation } from 'react-i18next'

import MaterialActivityRelationModal from './components/MaterialActivityRelationModal'
import { useProtocolDetail } from './hooks/useProtocolDetail'
import { columnsListActivityMaterial } from './protocol.constant'
import { ActivityMaterial } from './protocol.type'

export default function ProtocolDetailPage(): JSX.Element {
  usePermission('protocol-view')
  const { t, i18n } = useTranslation(['common', 'protocol'])

  const {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading,
    filter,
    showModal,
    onChangeShowModal,
    setDeleteMaterialData,
    deleteRelation,
  } = useProtocolDetail()

  useSetLoadingPopupStore(isLoading)

  return (
    <>
      <ModalConfirmation
        open={showModal.deleteRelation}
        type="delete"
        description={t(
          'protocol:detail.material_activity.relation.confirmation.delete.description'
        )}
        setOpen={(value: boolean) => onChangeShowModal('deleteRelation', value)}
        onSubmit={deleteRelation}
      />

      <MaterialActivityRelationModal
        protocolName={data?.protocol_name || '-'}
        open={showModal.addRelation}
        setModal={(value: boolean) => onChangeShowModal('addRelation', value)}
      />

      <Container
        title={t('protocol:detail.title')}
        hideTabs={false}
        withLayout={true}
        backButton={{ show: true }}
      >
        <Meta title={`Smile | ${t('protocol:detail.title')}`} />

        <div>
          <p className="ui-text-sm ui-text-[#737373]">
            {t('protocol:column.name')}:
          </p>
          <h3 className="ui-text-base ui-font-bold ui-text-[#0C3045]">
            {data?.protocol_name || '-'}
          </h3>
        </div>

        <div className="mt-6 space-y-6">
          <FilterFormRoot
            onSubmit={filter.handleSubmit}
            className="ui-border-none ui-p-0"
          >
            <FilterFormBody className="ui-grid ui-grid-cols-2 ui-items-center ui-gap-4">
              <div>
                <h2 className="ui-text-xl ui-font-bold ui-text-[#041D2F]">
                  {t('protocol:detail.material_activity.title')}
                </h2>
              </div>
              <div className="ui-flex ui-items-center ui-gap-4">
                <div className="ui-flex-1 -ui-mt-2">{filter.renderField()}</div>
                <Button
                  id="btn-add-relation"
                  type="button"
                  leftIcon={<Plus className="ui-size-5" />}
                  onClick={() => onChangeShowModal('addRelation', true)}
                >
                  {t('protocol:detail.material_activity.relation.add.button')}
                </Button>
              </div>
            </FilterFormBody>
          </FilterFormRoot>
          <DataTable
            data={data?.data}
            isLoading={isLoading}
            columns={columnsListActivityMaterial(t, i18n.language, {
              page: pagination.page,
              size: pagination.paginate,
              onDelete: (activityMaterial: ActivityMaterial) => {
                onChangeShowModal('deleteRelation', true)
                setDeleteMaterialData(activityMaterial)
              },
            })}
          />
          <div className="ui-mt-4">
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
        </div>
      </Container>
    </>
  )
}
