'use client'

import { useMemo, useState } from 'react'
import { Button } from '#components/button'
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
import { getReactSelectValue } from '#utils/react-select'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

import FinishedVaccineModal from './components/FinishedVaccineModal'
import NotificationFilter from './components/NotificationFilter'
import { useNotificationList } from './hooks/useNotificationList'
import notificationFilterFormSchema from './schemas/notificationFilterFormSchema'
import { createColumns } from './notification.constants'

export type FormFilterManufacturerType = {
  keyword: string
  type: string
}

export default function NotificationListPage({
  isGlobal = true,
}: Readonly<CommonType>) {
  usePermission('notification-global-view')
  const {
    t,
  } = useTranslation(['common', 'notification'])
  const [openReadAll, setOpenReadAll] = useState(false)

  const filterSchema = useMemo<UseFilter>(
    () => notificationFilterFormSchema(t),
    [t]
  )

  const filter = useFilter(filterSchema)

  const {
    data,
    showModal,
    isLoading,
    handleChangePage,
    handleMarkAllAsRead,
    handleChangePaginate,
    handleActionButtonClick,
    handleNotificationItemClick,
    handleSuccessFinishVaccine,
  } = useNotificationList({
    filter: {
      program_ids: getReactSelectValue(filter?.query?.program_ids),
      entity_tag_ids: getReactSelectValue(filter?.query?.entity_tag_ids),
      city_district_id: getReactSelectValue(filter?.query?.regency_id),
      province_id: getReactSelectValue(filter?.query?.province_id),
      receive_date: filter?.query?.receive_date?.toString(),
      notification_type: getReactSelectValue(filter?.query?.notification_type),
      health_center_id: getReactSelectValue(filter?.query?.health_center_id),
    },
  })

  useSetLoadingPopupStore(isLoading)

  const titlePage = generateMetaTitle(
    t('notification:title.notification'),
    isGlobal
  )

  const columns = useMemo(() => createColumns({
    handleNotificationItemClick,
    handleActionButtonClick,
  }), [handleNotificationItemClick, handleActionButtonClick])

  return (
    <>
      {showModal.data && (
        <FinishedVaccineModal
          isOpen={showModal.type === 'finishedVaccine'}
          onClose={handleSuccessFinishVaccine}
          handleNotificationRead={handleNotificationItemClick}
          notification={showModal.data}
          dataStopConfirmation={showModal.data_stop_confirmation}
        />
      )}

      <Container
        title={t('notification:title.notification')}
        hideTabs
        withLayout={isGlobal}
      >
        <Meta title={titlePage} />
        <div className="mt-6 space-y-4">
          <NotificationFilter
            page={data?.page ?? 1}
            paginate={data?.item_per_page ?? 10}
            handleChangePage={handleChangePage}
            filter={filter}
            isGlobal={isGlobal}
          />
          <div className="ui-flex ui-items-center ui-justify-end ui-gap-4">
            <div className="ui-flex ui-items-center ui-gap-4">
              <Button variant="subtle" onClick={() => setOpenReadAll(true)}>
                {t('notification:button.mark_all_as_read')}
              </Button>
            </div>
          </div>
          <DataTable
            data={data?.data}
            withHeader={false}
            isLoading={isLoading}
            columns={columns}
          />
          <PaginationContainer>
            <PaginationSelectLimit
              size={data?.item_per_page}
              onChange={handleChangePaginate}
              perPagesOptions={data?.list_pagination}
            />
            <PaginationInfo
              size={data?.item_per_page}
              currentPage={data?.page}
              total={data?.total_item}
            />
            <Pagination
              totalPages={data?.total_page ?? 1}
              currentPage={data?.page}
              onPageChange={handleChangePage}
            />
          </PaginationContainer>
        </div>
        <ModalConfirmation
          open={openReadAll}
          setOpen={setOpenReadAll}
          onSubmit={handleMarkAllAsRead}
          title={t('notification:modal.title.mark_all')}
          description={t('notification:modal.description.mark_all')}
        />
      </Container>
    </>
  )
}
