import { useState } from 'react'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { useFilter, UseFilter } from '#components/filter'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { listProtocol, updateStatusProtocol } from '../protocol.service'
import { DetailProtocolResponse } from '../protocol.type'

export const useProtocolList = () => {
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
  const [showModal, setShowModal] = useState(false)

  const filterSchema: UseFilter = [
    {
      type: 'text',
      name: 'keyword',
      label: t('common:search'),
      placeholder: t('protocol:title.search'),
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
    refetch: fetchListProtocol,
  } = useQuery({
    queryKey: ['protocols', filter?.query, pagination],
    queryFn: () =>
      listProtocol({
        keyword: filter?.query?.keyword,
        ...pagination,
      }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })

  const handleChangeLimit = (paginate: number) =>
    setPagination({ paginate, page: 1 })

  const [selectedProtocolData, setSelectedProtocolData] =
    useState<DetailProtocolResponse | null>(null)

  const { mutate: handleChangeStatusProtocol } = useMutation({
    onMutate: () => setLoadingPopup(true),
    mutationFn: () =>
      updateStatusProtocol(selectedProtocolData as DetailProtocolResponse),
    onSettled: () => setLoadingPopup(false),
    onSuccess: () => {
      toast.success({
        description:
          selectedProtocolData?.status === 0
            ? t('protocol:action.activate.success')
            : t('protocol:action.deactivate.success'),
      })
      fetchListProtocol()
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
    setShowModal,
    selectedProtocolData,
    setSelectedProtocolData,
    changeStatusProtocol: handleChangeStatusProtocol,
  }
}
