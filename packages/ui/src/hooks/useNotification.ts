import { useState } from 'react'
import { useRouter } from 'next/router'
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '#components/toast'
import {
  downloadNotification,
  getNotificationCount,
  getNotificationHeader,
  requestReadAllNotification,
  requestReadById,
  TNotificationParams,
} from '#services/notification'
import { TNotification } from '#types/notification'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useFeatureIsOn } from '@growthbook/growthbook-react'

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
}

export const useNotification = ({ filter }: UseNotificationParams) => {
  const {
    i18n: { language },
  } = useTranslation()
  const router = useRouter()
  const user = getUserStorage()
  const isCountNotificationOn = useFeatureIsOn('count.notification')

  const [show, setShow] = useState(false)

  const [showModal, setShowModal] = useState<ShowModal>({
    type: null,
    data: null,
  })

  const handleChangePage = (page: number) => {}

  const handleChangePaginate = (paginate: number) => {
    handleChangePage(1)
  }

  const {
    data,
    refetch: refetchNotification,
    isFetching,
    isSuccess,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['getNotification', show, language],
    queryFn: () => getNotificationHeader(),
    placeholderData: keepPreviousData,
    enabled: show,
  })

  const { data: count, refetch: refetchCount } = useQuery({
    queryKey: ['getCountNotification', show],
    queryFn: () => getNotificationCount(),
    select: (res) => res.unread,
    initialData: {
      unread: 0,
    },
    enabled: isCountNotificationOn && user?.is_disabled_notification === 0,
  })

  const { mutate: readAll, isPending: isPendingReadAll } = useMutation({
    mutationKey: ['readAllNotification'],
    mutationFn: requestReadAllNotification,
    onSuccess: () => {
      refetchNotification()
      refetchCount()
    },
    onError: (error: AxiosError) => {
      console.log(error)
      toast.danger({ description: error?.message || 'Error' })
    },
  })

  const { mutate: read, isPending: isPendingRead } = useMutation({
    mutationKey: ['readAllNotification'],
    mutationFn: requestReadById,
    onSuccess: () => {
      refetchNotification()
      refetchCount()
    },
  })

  const { mutate: downloadFromNotif, isPending: isPendingDonwload } =
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

  const handleActionButtonClick = (
    actionType: ActionButtonType,
    item: TNotification
  ) => {
    switch (actionType) {
      case 'download':
        return downloadFromNotif(item?.download_url ?? '')
      case 'whatsapp':
        if (!item?.data?.whatsapp_message) return

        return window.open(item.data.whatsapp_message, '_blank')
      case 'finishedVaccine':
        setShowModal({
          type: actionType,
          data: item,
        })
        break
      default:
        return router.push(item?.action_url ?? '')
    }
  }

  const handleSeeMore = () => {
    setShow((prev) => !prev)
    router.push(`/${language}/v5/notification`)
  }

  const handleMarkAllAsRead = () => readAll()

  return {
    data: data,
    isPendingDonwload,
    count,
    show,
    setShow,
    isLoading: isLoading || isFetching,
    isError,
    isSuccess,
    downloadFromNotif,
    read,
    readAll,
    showModal,
    setShowModal,
    isPendingRead,
    isPendingReadAll,
    isDisabled: !user || user?.is_disabled_notification === 1,
    refetchCount,
    refetchNotification,
    handleNotificationItemClick,
    handleActionButtonClick,
    handleSeeMore,
    handleMarkAllAsRead,
    handleChangePage,
    handleChangePaginate,
  }
}
