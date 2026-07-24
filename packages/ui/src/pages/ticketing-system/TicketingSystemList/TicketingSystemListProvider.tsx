import React, { createContext, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Pagination } from '#types/common'
import { removeEmptyObject } from '#utils/object'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { getTicketingSystemList } from './ticketing-system-list.service'
import {
  TicketingSystemListItem,
  TicketingSystemListParams,
} from './ticketing-system-list.type'
import useTicketingSystemListTable from './use-cases/displayData/useTicketingSystemListTable'
import useTicketingSystemListFilter from './use-cases/filter/useTicketingSystemListFilter'

type TicketingSystemListContextValue = {
  data: TicketingSystemListItem[]
  isLoading: boolean
  isFullPageLoading?: boolean
  pagination: Pagination & {
    totalItem: number
    totalPage: number
    itemPerPage: number
    update: (pagination: Partial<Pagination>) => void
  }
  filter: ReturnType<typeof useTicketingSystemListFilter>
  columns: ColumnDef<TicketingSystemListItem>[]
  params: TicketingSystemListParams
}

const TicketingSystemListContext = createContext<
  TicketingSystemListContextValue | undefined
>(undefined)

export const TicketingSystemListProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { i18n } = useTranslation('ticketingSystemList')

  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const filter = useTicketingSystemListFilter()
  const table = useTicketingSystemListTable()
  const params = { ...pagination, ...filter.query } as TicketingSystemListParams

  const {
    data: response,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [i18n.language, 'ticketing-systems', params],
    queryFn: () =>
      getTicketingSystemList(
        removeEmptyObject({
          page: params.page,
          paginate: params.paginate,
          do_number: params.do_number,
          order_id: params?.order_id ? Number(params.order_id) : undefined,
          from_arrived_date: params.arrived_date?.start,
          to_arrived_date: params.arrived_date?.end,
          entity_tag_id: params.entity_tag?.value,
          province_id: params.province?.value,
          regency_id: params.regency?.value,
          status: params.status?.value,
        })
      ),
  })

  return (
    <TicketingSystemListContext.Provider
      value={{
        data: response?.data ?? [],
        isLoading: isLoading || isFetching,
        pagination: {
          ...pagination,
          totalItem: response?.total_item ?? 0,
          totalPage: response?.total_page ?? 0,
          itemPerPage: response?.item_per_page ?? 0,
          update: ({ page, paginate }) => {
            setPagination({
              page: page ?? pagination.page,
              paginate: paginate ?? pagination.paginate,
            })
          },
        },
        filter,
        columns: table.columns,
        params,
      }}
    >
      {children}
    </TicketingSystemListContext.Provider>
  )
}

export const useTicketingSystemListContext = () => {
  const context = useContext(TicketingSystemListContext)
  if (!context) {
    throw new Error(
      'useTicketingSystemListContext must be used within a TicketingSystemListProvider'
    )
  }
  return context
}
