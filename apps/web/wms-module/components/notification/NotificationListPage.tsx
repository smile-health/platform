'use client';

import Meta from '@/components/layouts/Meta';
import Container from '@/components/layouts/PageContainer';
import { Button } from '@repo/ui/components/button';
import {
  Pagination,
  PaginationContainer,
  PaginationInfo,
  PaginationSelectLimit,
} from '@repo/ui/components/pagination';
import { DataTable } from '@repo/ui/components/data-table';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';

import { CommonType } from '@/types/common';
import { TNotification } from '@/types/notification';
import { ModalConfirmation } from '../ModalConfirmation';
import NotificationFilter from './components/NotificationFilter';
import NotificationWithRequestApproval from './components/NotificationWithRequestApproval';
import { useNotification } from './hooks/useNotification';

function getNotificationColumns(
  handleNotificationItemClick: (item: TNotification) => void
): ColumnDef<TNotification>[] {
  return [
    {
      header: '',
      accessorKey: 'type',
      meta: {
        cellClassName: '!ui-p-0',
      },
      cell: ({ row }: { row: Row<TNotification> }) => (
        <NotificationWithRequestApproval
          type="page"
          withBorder={false}
          item={row.original}
          handleNotificationItemClick={handleNotificationItemClick}
        />
      ),
    },
  ];
}

export default function NotificationListPage({
  isGlobal = true,
}: Readonly<CommonType>) {
  const { t } = useTranslation(['common', 'notification']);
  const [openReadAll, setOpenReadAll] = useState(false);

  const {
    filter,
    data,
    isLoading,
    handleChangePage,
    handleChangePaginate,
    handleMarkAllAsRead,
    handleNotificationItemClick,
    page,
    paginate,
  } = useNotification();

  const columns = getNotificationColumns(handleNotificationItemClick);

  return (
    <Container
      title={t('notification:title.notification')}
      hideTabs={false}
      withLayout
    >
      <Meta title="WMS | Notification" />

      <div className="ui-mt-6 ui-space-y-4">
        <NotificationFilter
          page={data?.page ?? 1}
          paginate={data?.item_per_page ?? 10}
          handleChangePage={handleChangePage}
          filter={filter}
          isGlobal={isGlobal}
        />

        {(data?.data?.data ?? []).length > 0 && (
          <div className="ui-flex ui-items-center ui-justify-end ui-gap-4">
            <Button variant="subtle" onClick={() => setOpenReadAll(true)}>
              {t('notification:button.mark_all_as_read')}
            </Button>
          </div>
        )}

        <DataTable
          data={data?.data.data ?? []}
          withHeader={false}
          isLoading={isLoading}
          columns={columns}
        />

        <PaginationContainer>
          <PaginationSelectLimit
            size={paginate}
            onChange={handleChangePaginate}
            perPagesOptions={data?.list_pagination}
          />
          <PaginationInfo
            size={paginate}
            currentPage={page}
            total={data?.data?.pagination?.total}
          />
          <Pagination
            totalPages={data?.data?.pagination?.pages ?? 0}
            currentPage={page}
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
  );
}
