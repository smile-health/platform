import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useLoadingPopupStore } from '#store/loading.store'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useDisposalInstructionDetailQuery } from '../../disposal-instruction-detail.query'
import { commentFormSchema } from './comment.schema'
import { createComment } from './comment.service'
import { CommentFormValues } from './comment.type'

export const useComment = () => {
  const { t } = useTranslation(['disposalInstructionDetail'])

  const params = useParams()
  const disposalInstructionId = params.id as string

  const { setLoadingPopup } = useLoadingPopupStore()
  const disposalInstructionDetailQuery = useDisposalInstructionDetailQuery(
    disposalInstructionId
  )

  const methods = useForm<CommentFormValues>({
    defaultValues: {
      comment: undefined,
    },
    resolver: yupResolver(commentFormSchema(t)),
  })

  const mutation = useMutation({
    mutationKey: ['disposal-instruction-detail-comment'],
    mutationFn: (values: CommentFormValues) =>
      createComment(disposalInstructionId, { comment: values.comment ?? '' }),
    onSuccess: async () => {
      toast.success({
        description: t(
          'disposalInstructionDetail:api_response.comment_success'
        ),
      })
      await disposalInstructionDetailQuery.refetch()
      setLoadingPopup(false)
      methods.setValue('comment', '')
    },
    onError: () => {
      toast.danger({
        description: t('disposalInstructionDetail:api_response.comment_failed'),
      })
      setLoadingPopup(false)
    },
  })

  const errors = methods.formState.errors
  const isLoading = mutation.isPending

  const handleSubmitComment = (values: CommentFormValues) =>
    mutation.mutate(values)

  return {
    form: {
      methods,
      errors,
      submit: () => methods.handleSubmit(handleSubmitComment)(),
      isLoading,
    },
  }
}
