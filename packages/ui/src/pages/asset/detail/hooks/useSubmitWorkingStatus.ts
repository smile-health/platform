import { useContext, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { TCommonObject } from '#types/common'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'

import { updateStatusAsset } from '../../services/asset.services'
import AssetDetailContext from '../libs/asset-detail.context'

export const useSubmitWorkingStatus = () => {
  const { data } = useContext(AssetDetailContext)
  const [isChangeMode, setIsChangeMode] = useState(false)
  const { handleSubmit, control, setValue } = useForm<{
    working_status_id: OptionType | TCommonObject | null
  }>({
    defaultValues: {
      working_status_id: null,
    },
    mode: 'onChange',
  })

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (working_status_id: number) =>
      updateStatusAsset(working_status_id, Number(data?.id)),
    onSuccess: (response) => {
      toast.success({
        description: response?.data?.message,
      })
      setIsChangeMode(false)
    },
    onError: (error: AxiosError) => {
      const { message } = error.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  useEffect(() => {
    if (data?.asset_status)
      setValue('working_status_id', {
        label: data?.asset_status?.name,
        value: data?.asset_status?.id,
      })
  }, [data?.asset_status])

  const onSubmit = (formValue: {
    working_status_id: TCommonObject | OptionType
  }) => {
    if (!formValue?.working_status_id) return
    const { value } = formValue?.working_status_id as OptionType
    updateStatus(value)
  }

  useSetLoadingPopupStore(isUpdatingStatus)

  return {
    control,
    handleSubmit: handleSubmit(onSubmit),
    isChangeMode,
    setIsChangeMode,
  }
}
