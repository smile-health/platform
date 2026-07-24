import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import { Values } from 'nuqs';
import { useTranslation } from 'react-i18next';

import { handleFilter } from '../utils/helper';

import 'dayjs/locale/en';
import 'dayjs/locale/id';

import {
  getManualScaleUserActivity,
  getUserActivity,
} from '@/services/user-activity';
import { useEffect, useState } from 'react';

dayjs.extend(localeData);

export default function useGetEntityTable(filter: Values<Record<string, any>>) {
  const {
    t,
    i18n: { language },
  } = useTranslation('userActivity');

  const [{ page, paginate }, setPagination] = useState({
    page: 1,
    paginate: 10,
  });

  const params = handleFilter({ page, limit: paginate, ...filter });
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['entity-activity', params],
    queryFn: () => getUserActivity(params),
  });

  const {
    data: manualScaleData,
    isLoading: manualScaleLoading,
    isFetching: manualScaleFetching,
  } = useQuery({
    queryKey: ['manual-scale-activity', params],
    queryFn: () => getManualScaleUserActivity(params),
  });

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }));
    handleChangePage(1);
  };

  useEffect(() => {
    dayjs.locale(language);
  }, [language]);

  return {
    page,
    paginate,
    totalItem: data?.data.pagination.total,
    totalPage: data?.data.pagination.pages,
    listPagination: data?.list_pagination,
    isLoading:
      isLoading || isFetching || manualScaleLoading || manualScaleFetching,
    handleChangePage,
    handleChangePaginate,
    data: data?.data?.data || [],
    manualScaleData: manualScaleData?.data?.data || [],
  };
}
