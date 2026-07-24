import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { SuccessResponse } from '#types/common'
import { AxiosError } from 'axios'

import { importProtocol } from '../protocol.service'
import { ModalImportErrors } from '../protocol.type'

export const useProtocolImport = () => {
  const [showImport, setShowImport] = useState<boolean>(false)
  const [modalImportErrors, setModalImportErrors] = useState<{
    open: boolean
    errors?: ModalImportErrors
  }>({ open: false, errors: undefined })
  const queryClient = useQueryClient()

  const { mutate: onImport, isPending: isPendingImport } = useMutation({
    mutationFn: (data: FormData) => importProtocol(data),
    onSuccess: async (result: SuccessResponse) => {
      toast.success({ description: result.message })
      await queryClient.invalidateQueries({
        queryKey: ['protocols'],
      })
    },
    onError: (err: AxiosError) => {
      const { message, errors } = err.response?.data as {
        message: string
        errors?: ModalImportErrors
      }
      if (!errors || (errors && Object.hasOwn(errors, 'general')))
        toast.danger({ description: errors?.general[0] ?? message })
      else setModalImportErrors({ open: true, errors })
    },
  })

  return {
    showImport,
    setShowImport,
    modalImportErrors,
    setModalImportErrors,
    onImport,
    isPendingImport,
  }
}
