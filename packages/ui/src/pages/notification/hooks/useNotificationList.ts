import { useState } from 'react'
import { useRouter } from 'next/router'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '#components/toast'
import {
  downloadNotification,
  getNotification,
  getNotificationConfirmation,
  getNotificationCount,
  requestReadAllNotification,
  requestReadById,
  TNotificationParams,
} from '#services/notification'
import { GetNotificationConfirmationParams, GetNotificationConfirmationResponse, TNotification } from '#types/notification'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { parseAsInteger, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

type UseNotificationParams = {
  filter?: TNotificationParams
}

export type ActionButtonType =
  | 'action'
  | 'download'
  | 'whatsapp'
  | 'finishedVaccine'

export type ShowModal = {
  type: ActionButtonType | null
  data: TNotification | null
  data_stop_confirmation?: GetNotificationConfirmationResponse
}

export const useNotificationList = ({ filter }: UseNotificationParams) => {
  const {
    i18n: { language },
  } = useTranslation()
  const router = useRouter()
  const user = getUserStorage()

  const [{ page, paginate }, setPagination] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      paginate: parseAsInteger.withDefault(10),
    },
    {
      history: 'push',
    }
  )

  const [showModal, setShowModal] = useState<ShowModal>({
    type: null,
    data: null,
  })

  const currentFilter = {
    ...filter,
    page,
    paginate,
  }

  const handleChangePage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination((prev) => ({ ...prev, paginate }))
    handleChangePage(1)
  }


  const {
    data,
    isFetching,
    isLoading,
    refetch: refetchNotification,
  } = useQuery({
    queryKey: ['getNotificationList', currentFilter, language],
    queryFn: () => getNotification(currentFilter),
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled:
      router.isReady && Object.values(filter || {}).some((item) => !!item),
  })

  const { refetch: refetchCount } = useQuery({
    queryKey: ['getCountNotificationList'],
    queryFn: () => getNotificationCount(),
    select: (res) => res.unread,
    initialData: {
      unread: 0,
    },
    enabled: !!user,
  })

  const { mutate: readAll } = useMutation({
    mutationKey: ['readAllNotificationList'],
    mutationFn: requestReadAllNotification,
    onSuccess: () => {
      refetchNotification()
      refetchCount()
    },
    onError: (error: AxiosError) => {
      toast.danger({ description: error?.message || 'Error' })
    },
  })

  const { mutate: read } = useMutation({
    mutationKey: ['readAllNotification'],
    mutationFn: requestReadById,
    onSuccess: () => {
      refetchNotification()
      refetchCount()
    },
  })

  const { mutate: downloadFromNotif } =
    useMutation({
      mutationKey: ['downloadNotification'],
      mutationFn: downloadNotification,
      onError: (err) => toast.danger({ description: err.message }),
    })

  const handleNotificationItemClick = (item: TNotification) => {
    if (item.read_at === null) {
      read(item.id)
    }
  }

  const {
    // For next enhancement
    // mutate: mutateGetNotificationConfirmation,
    isPending: isLoadingGetNotificationConfirmation
  } = useMutation({
    mutationKey: ['getNotificationConfirmation'],
    mutationFn: (params: GetNotificationConfirmationParams) => getNotificationConfirmation(params),
    onSuccess: (data) => {
      setShowModal((prev) => ({
        ...prev,
        type: 'finishedVaccine',
        data_stop_confirmation: data,
      }))
    },
    onError: (error: AxiosError) => {
      setShowModal({
        type: null,
        data: null,
      })
      toast.danger({ description: error?.message || 'Error' })
    },
  })

  const handleActionButtonClick = (
    actionType: ActionButtonType,
    item: TNotification
  ) => {
    switch (actionType) {
      case 'download':
        handleNotificationItemClick(item)
        return downloadFromNotif(item?.download_url ?? '')
      case 'whatsapp':
        handleNotificationItemClick(item)
        if (!item.data?.whatsapp_message) return
        return window.open(item.data?.whatsapp_message, '_blank')
      case 'finishedVaccine':
        // For next enhancement
        // mutateGetNotificationConfirmation({ consumption_id: item.data?.consumption_id ?? '', program_id: item.program.id })
        setShowModal((prev) => ({
          ...prev,
          type: 'finishedVaccine',
          data: item,
        }))
        break
      default:
        return router.push(item?.action_url ?? '')
    }
  }

  const handleMarkAllAsRead = () => readAll()

  const handleSuccessFinishVaccine = () => {
    refetchNotification()
    refetchCount()
    setShowModal({ type: null, data: null })
  }

  return {
    showModal,
    setShowModal,
    handleNotificationItemClick,
    handleActionButtonClick,
    handleMarkAllAsRead,
    handleChangePage,
    handleChangePaginate,
    data,
    isLoading: isFetching || isLoading || isLoadingGetNotificationConfirmation,
    handleSuccessFinishVaccine,
  }
}
