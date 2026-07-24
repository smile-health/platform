import { useParams, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import { getPQSdetail } from '../pqs.service'
import { CreatePQSFormInput } from '../pqs.types'

export const usePQSDetail = () => {
  const { t } = useTranslation(['common', 'pqs'])
  const params = useParams()
  const { pushGlobal } = useSmileRouter()
  const searchParams = useSearchParams()
  const isFromDetail = searchParams.get('fromPage') === 'detail'
  const detailPath = isFromDetail && params?.id ? params.id : ''

  const backUrl = () => {
    return pushGlobal(`/v5/global-settings/asset/pqs/${detailPath}`)
  }

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ['pqs-detail', params?.id],
    queryFn: () => getPQSdetail(Number(params?.id)),
    enabled: Boolean(params?.id),
    refetchOnWindowFocus: false,
  })

  const defaultValue: CreatePQSFormInput = {
    code: data?.pqs_code ?? '',
    pqs_type_id: data?.pqs_type?.id
      ? {
          label: data?.pqs_type?.name,
          value: data?.pqs_type?.id,
        }
      : undefined,
    cceigat_description_id: data?.cceigat_description?.id
      ? {
          label: data?.cceigat_description?.name,
          value: data?.cceigat_description?.id,
        }
      : undefined,
    net_capacity5: data?.capacities?.[0]?.capacities5 ?? undefined,
    net_capacityMin20: data?.capacities?.[1]?.capacitiesMin20 ?? undefined,
    net_capacityMin86: data?.capacities?.[2]?.capacitiesMin86 ?? undefined,
    is_related_asset: data?.is_related_asset ?? 0,
  }

  return {
    data,
    isLoading: isLoading || isFetching,
    defaultValue,
    error,
    t,
    handleBackToList: () => backUrl(),
  }
}
