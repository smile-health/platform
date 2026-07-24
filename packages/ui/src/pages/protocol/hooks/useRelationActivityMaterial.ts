import { useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useLoadingPopupStore } from '#store/loading.store'
import { AxiosError } from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { relationSchema } from '../protocol.schema'
import { addRelationActivityMaterial } from '../protocol.service'
import { RelationActivityMaterial, TRelationForm } from '../protocol.type'

export default function useRelationActivityMaterial() {
  const { t } = useTranslation(['common', 'protocol'])
  const router = useSmileRouter()
  const { id } = router.query
  const { setLoadingPopup } = useLoadingPopupStore()

  const form = useForm<TRelationForm>({
    resolver: yupResolver(relationSchema(t)),
    defaultValues: {
      relations: [],
    },
  })

  const queryClient = useQueryClient()

  const { mutate: addRelation } = useMutation({
    onMutate: () => setLoadingPopup(true),
    mutationFn: (data: TRelationForm) =>
      addRelationActivityMaterial(Number(id), data),
    onSettled: () => setLoadingPopup(false),
    onSuccess: () => {
      toast.success({
        description: t(
          'protocol:detail.material_activity.relation.add.success'
        ),
      })
      queryClient.invalidateQueries({
        queryKey: ['protocol-material-activity'],
      })
    },
    onError: (err: AxiosError) => {
      console.error(err)
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message || t('message.common.error') })
    },
  })

  const { fields: inputFields } = useFieldArray({
    control: form.control,
    name: 'relations',
  })

  const [confirmationCloseModal, setConfirmationCloseModal] = useState(false)

  const handleSubmit = (fallback: () => void) => {
    const values = form.getValues().relations

    let isError = false
    values.forEach((item: RelationActivityMaterial, index) => {
      if (!item.activity?.value) {
        isError = true
        form.setError(
          `relations.${index}.activity`,
          { message: t('common:validation.required') },
          { shouldFocus: true }
        )
      }
      if (!item.material?.value) {
        isError = true
        form.setError(
          `relations.${index}.material`,
          { message: t('common:validation.required') },
          { shouldFocus: true }
        )
      }
    })

    if (isError) return

    addRelation(form.getValues(), { onSuccess: fallback })
  }

  return {
    form,
    control: form.control,
    errors: form.formState.errors,
    inputFields,
    confirmationCloseModal,
    handleSubmit,
    watch: form.watch,
    setValue: form.setValue,
    setError: form.setError,
    setConfirmationCloseModal,
  }
}
