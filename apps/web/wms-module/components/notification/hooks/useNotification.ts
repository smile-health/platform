import {
  getNotification,
  getNotificationCount,
  requestReadAllNotification,
  requestReadById,
} from '@/services/notification';
import { TNotification } from '@/types/notification';
import { isGroupAdminRole, isSuperAdmin } from '@/utils/getUserRole';
import { handleAxiosError } from '@/utils/handleAxiosError';
import { getUserStorage } from '@/utils/storage/user';
import { UseFilter, useFilter } from '@repo/ui/components/filter';
import { getReactSelectValue } from '@repo/ui/utils/react-select';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { parseAsInteger, useQueryStates } from 'nuqs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationFilterFormSchema } from '../schemas/notificationFilterFormSchema';

export type ActionButtonType = 'action' | 'download' | 'whatsapp' | 'rabies';

export const useNotification = () => {
  const [show, setShow] = useState(false);
  const router = useRouter();
  const user = getUserStorage();
  const isPageNotification = router.pathname.includes('notification');

  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [{ page, paginate }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  );

  const filterSchema = useMemo<UseFilter>(
    () => notificationFilterFormSchema({ t, isPageNotification }),
    [t, isPageNotification]
  );

  const filter = useFilter(filterSchema);

  const {
    provinceId,
    regencyId,
    dateRangeNotification,
    entityId,
    notification_type,
  } = filter.query;

  const params = {
    page: page || 1,
    limit: show ? (isPageNotification ? 10 : 3) : paginate || 10,
    createdStart: dateRangeNotification?.start,
    createdEnd: dateRangeNotification?.end,
    provinceId: getReactSelectValue(provinceId),
    regencyId: getReactSelectValue(regencyId),
    entityId: getReactSelectValue(entityId),
    type: getReactSelectValue(notification_type),
    ...(isSuperAdmin() && { forSuperAdmin: true }),
    ...(isGroupAdminRole() && { forAdmin: true }),
  };

  const {
    data,
    refetch: refetchNotification,
    isFetching,
    isLoading,
  } = useQuery({
    queryKey: ['getNotification', show, params, language],
    queryFn: () => getNotification(params),
    placeholderData: keepPreviousData,
    enabled:
      show || isPageNotification || (isPageNotification && Boolean(language)),
  });

  const paramsCount = {
    ...(isSuperAdmin() && { forSuperAdmin: true }),
    ...(isGroupAdminRole() && { forAdmin: true }),
  };
  const { data: count, refetch: refetchCount } = useQuery({
    queryKey: ['getCountNotification', show],
    queryFn: () => getNotificationCount(paramsCount),
    select: (res) => res.data.total,
    enabled: !!user,
  });

  const { mutate: readAll, isPending: isPendingReadAll } = useMutation({
    mutationKey: ['readAllNotification'],
    mutationFn: requestReadAllNotification,
    onSuccess: () => {
      refetchNotification();
      refetchCount();
    },
    onError: handleAxiosError,
  });

  const { mutate: read, isPending: isPendingRead } = useMutation({
    mutationKey: ['readAllNotification'],
    mutationFn: requestReadById,
    onSuccess: () => {
      refetchNotification();
      refetchCount();
    },
  });

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }));
    handleChangePage(1);
  };

  const handleNotificationItemClick = (item: TNotification) => {
    if (item.readAt === null) {
      read(item.id);
    }
  };

  const handleMarkAllAsRead = () => {
    readAll();
  };

  return {
    filter,
    data,
    count: count || 0,
    show,
    isLoading: isFetching || isLoading,
    setShow,
    read,
    readAll,
    page,
    paginate,
    isPendingRead,
    isPendingReadAll,
    handleMarkAllAsRead,
    handleChangePage,
    handleChangePaginate,
    handleNotificationItemClick,
  };
};
