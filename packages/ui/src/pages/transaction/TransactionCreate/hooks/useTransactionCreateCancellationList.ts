import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { TCommonResponseList } from '#types/common'
import { parseDateTime } from '#utils/date'
import dayjs from 'dayjs'
import { UseFormReturn } from 'react-hook-form'

import { TRANSACTION_TYPE } from '../transaction-create.constant'
import { CreateTransctionForm } from '../transaction-create.type'
import { listTransactionDiscard } from '../TransactionCancelDiscard/transaction-cancel-discard.service'
import {
  Filter,
  TransactionsDiscard,
} from '../TransactionCancelDiscard/transaction-cancel-discard.type'
import { listTransactionConsumption } from '../TransactionReturnFromFacility/transaction-return-from-facility.service'
import { TTransactionReturnFacilityConsumptionData } from '../TransactionReturnFromFacility/transaction-return-from-facility.type'

type Props = {
  methods: UseFormReturn<CreateTransctionForm, any, undefined>
}

export const useTransactionCreateCancellationList = ({ methods }: Props) => {
  const { entity, activity, customer } = methods.watch()
  const router = useSmileRouter()
  const { type: transactionType } = router.query
  const [filter, setFilter] = useState<Filter>({
    page: 1,
    paginate: 10,
    transaction_type_id: TRANSACTION_TYPE.DISCARD,
    entity_id: entity?.value,
    activity_id: activity?.value,
    customer_id: customer?.value,
    material: null,
    material_type: null,
    transaction_reason: null,
    date_range: {
      start: dayjs().subtract(7, 'day').toISOString(),
      end: dayjs().toISOString(),
    },
  })
  const [shouldFetch, setShouldFetch] = useState(false)
  const [countFetch, setCountFetch] = useState(0)
  const [datasource, setDatasource] = useState<
    | (TCommonResponseList & {
        data: Array<
          TransactionsDiscard | TTransactionReturnFacilityConsumptionData
        >
        count_fetch?: number
      })
    | null
    | undefined
  >(null)

  const handleChangePage = (page: number) => {
    setFilter((prev) => ({ ...prev, page }))
    setShouldFetch(true)
  }

  const handleChangePaginate = (paginate: number) => {
    setFilter((prev) => ({ ...prev, paginate, page: 1 }))
    setShouldFetch(true)
  }

  const queryKey = [
    'transaction-list-cancellation',
    ...Object.values(filter),
    filter.date_range && {
      start_date: parseDateTime(filter.date_range.start, 'YYYY-MM-DD'),
      end_date: parseDateTime(filter.date_range.end, 'YYYY-MM-DD'),
    },
  ]

  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = {
        page: filter.page,
        paginate: filter.paginate,
        material_id: filter.material?.value,
        material_type_id: filter.material_type?.value,
        transaction_reason_id: filter.transaction_reason?.value,
        entity_id: entity?.value,
        activity_id: activity?.value,
        customer_id: customer?.value,
        ...(filter.date_range && {
          start_date: parseDateTime(filter.date_range.start, 'YYYY-MM-DD'),
          end_date: parseDateTime(filter.date_range.end, 'YYYY-MM-DD'),
        }),
      }

      setShouldFetch(false)
      setCountFetch((prev) => prev + 1)

      if (
        Number(transactionType) ===
        TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES
      ) {
        const response = await listTransactionConsumption(params)
        return response
      }

      const response = await listTransactionDiscard(params)
      return response
    },
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    select: (data) => ({
      ...data,
      count_fetch: countFetch,
    }),
  })

  const handleReset = () => {
    setFilter({
      page: 1,
      paginate: 10,
      transaction_type_id: TRANSACTION_TYPE.DISCARD,
      material: null,
      material_type: null,
      transaction_reason: null,
      date_range: {
        start: dayjs().subtract(7, 'day').toISOString(),
        end: dayjs().toISOString(),
      },
    })

    setShouldFetch(true)
    setCountFetch(0)
  }

  const handleSearch = (filter: Filter) => {
    setFilter(filter)
    setShouldFetch(true)
    setCountFetch(0)
  }

  useEffect(() => {
    const differentEntityValue = entity?.value !== filter?.entity_id
    const differentActivityValue = activity?.value !== filter?.activity_id
    const differentCustomerValue = customer?.value !== filter?.customer_id
    if (
      differentEntityValue ||
      differentActivityValue ||
      differentCustomerValue
    ) {
      setFilter((prev) => ({
        ...prev,
        entity_id: entity?.value,
        activity_id: activity?.value,
        customer_id: customer?.value,
        page: 1,
        paginate: 10,
      }))

      setTimeout(() => {
        setDatasource(null)
      }, 300)
    }
  }, [entity?.value, activity?.value, customer?.value])

  useEffect(() => {
    if (
      data &&
      'page' in data &&
      'item_per_page' in data &&
      'total_item' in data &&
      'total_page' in data &&
      Array.isArray(data.data)
    ) {
      setDatasource(
        data as TCommonResponseList & {
          data: Array<
            TransactionsDiscard | TTransactionReturnFacilityConsumptionData
          >
          count_fetch?: number
        }
      )
    } else {
      setDatasource(null)
    }
  }, [data])

  useSetLoadingPopupStore(isFetching)
  return {
    filter,
    handleSearch,
    handleReset,
    isFetching,
    datasource,
    handleChangePage,
    handleChangePaginate,
  }
}
