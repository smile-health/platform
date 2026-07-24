import { useState } from 'react'
import { useRouter } from 'next/router'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import {
  deleteRelationActivityMaterial,
  listActivityMaterial,
} from '../protocol.service'
import { ActivityMaterial } from '../protocol.type'

type TModalType = { addRelation: boolean; deleteRelation: boolean }

export const useProtocolDetail = () => {
  const { t } = useTranslation(['common', 'protocol'])
  const [pagination, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const { setLoadingPopup } = useLoadingPopupStore()
  const [showModal, setShowModal] = useState<TModalType>({
    addRelation: false,
    deleteRelation: false,
  })

  const onChangeShowModal = (type: keyof TModalType, value: boolean) => {
    setShowModal((prev) => ({
      ...prev,
      [type]: value,
    }))
  }

  const router = useRouter()
  const { id } = router.query

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: '',
      placeholder: t('protocol:detail.material_activity.search'),
      maxLength: 255,
      id: 'input-protocol-search',
      defaultValue: '',
    },
  ]

  const filter = useFilter(filterSchema)

  const {
    data,
    isLoading,
    isFetching,
    refetch: fetchListActivityMaterial,
  } = useQuery({
    queryKey: ['protocol-material-activity', filter?.query, pagination],
    queryFn: () =>
      listActivityMaterial(id as string, {
        keyword: filter?.query?.keyword,
        ...pagination,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const [deleteMaterialData, setDeleteMaterialData] =
    useState<ActivityMaterial | null>(null)

  const { mutate: deleteRelation } = useMutation({
    onMutate: () => setLoadingPopup(true),
    mutationFn: () =>
      deleteRelationActivityMaterial(deleteMaterialData as ActivityMaterial),
    onSettled: () => setLoadingPopup(false),
    onSuccess: () => {
      toast.success({
        description: t(
          'protocol:detail.material_activity.relation.confirmation.delete.success'
        ),
      })
      fetchListActivityMaterial()
    },
    onError: (err: AxiosError) => {
      console.error(err)
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message || t('message.common.error') })
    },
  })

  return {
    pagination,
    setPagination,
    handleChangeLimit,
    data,
    isLoading: isLoading || isFetching,
    filter,
    showModal,
    onChangeShowModal,
    setDeleteMaterialData,
    deleteRelation,
  }
}
