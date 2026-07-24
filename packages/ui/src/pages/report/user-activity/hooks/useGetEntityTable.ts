import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import { Values } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getEntityTableHeader } from '../user-activity.constant'
import { handleEntityTableData, handleFilter } from '../user-activity.helper'
import { getEntity } from '../user-activity.service'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

import { useEffect, useState } from 'react'

dayjs.extend(localeData)

export default function useGetEntityTable(filter: Values<Record<string, any>>) {
  const {
    t,
    i18n: { language },
  } = useTranslation('userActivity')

  const [{ page, paginate }, setPagination] = useState({
    page: 1,
    paginate: 10,
  })

  const params = handleFilter({ page, paginate, ...filter })

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['entity-activity', params],
    queryFn: () => getEntity(params),
    enabled: !!params?.from && !!params?.to,
  })

  const isShowCustomerActivity = Number(filter?.is_customer_activity) === 1

  const month = dayjs(filter?.periode?.start).format('MMMM YYYY')

  const headers = getEntityTableHeader(
    t,
    language,
    month,
    data?.interval_period || [],
    isShowCustomerActivity
  )

  const entities = handleEntityTableData(
    data?.data || [],
    page,
    paginate,
    language,
    isShowCustomerActivity
  )

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }

  useEffect(() => {
    dayjs.locale(language)
  }, [language])

  return {
    headers,
    entities,
    page,
    paginate,
    totalItem: data?.total_item,
    totalPage: data?.total_page ?? 1,
    listPagination: data?.list_pagination,
    isLoading: isLoading || isFetching,
    handleChangePage,
    handleChangePaginate,
  }
}
