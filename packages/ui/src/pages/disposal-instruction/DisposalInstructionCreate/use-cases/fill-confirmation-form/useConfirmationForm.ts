import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { confirmationFormSchema } from './confirmation-form.schema'
import { useConfirmationFormStore } from './confirmation-form.store'
import { ConfirmationFormValues } from './confirmation-form.type'

export const useConfirmationForm = () => {
  const confirmationForm = useConfirmationFormStore()

  const { t } = useTranslation(['common'])

  const methods = useForm<ConfirmationFormValues>({
    mode: 'onChange',
    defaultValues: {
      bast_no: '',
      disposal_comments: '',
    },
    resolver: yupResolver(confirmationFormSchema(t)),
  })

  return {
    methods,
    errors: methods.formState.errors,
    modal: {
      isShow: confirmationForm.isModalShow,
      show: confirmationForm.showModal,
      close: confirmationForm.closeModal,
    },
  }
}
