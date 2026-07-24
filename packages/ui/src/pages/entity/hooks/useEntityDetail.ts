import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { detailCoreEntity, detailEntity } from '#services/entity'
import { useTranslation } from 'react-i18next'

type Props = {
  isGlobal?: boolean
}

export const useEntityDetail = ({ isGlobal }: Props = {}) => {
  const {
    i18n: { language },
  } = useTranslation()
  const params = useParams()
  const id = params?.id

  const {
    data: entity,
    isError: isErrorEntity,
    error,
    isFetching: isFetchingEntity,
  } = useQuery({
    queryKey: ['getEntityDetail', language],
    queryFn: () =>
      isGlobal ? detailCoreEntity(id as string) : detailEntity(id as string),
    enabled: !!id,
    placeholderData: keepPreviousData,
  })

  useEffect(() => {
    if (isErrorEntity) toast.danger({ description: error.message })
  }, [isErrorEntity])

  useSetLoadingPopupStore(isFetchingEntity)

  return {
    entity,
  }
}
