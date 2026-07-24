import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { USER_ROLE } from '#constants/roles'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import {
  FieldErrors,
  useFieldArray,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningItemStore } from '../../reconciliation/ReconciliationCreate/store/modal-warning.store'
import { useModalResetStore } from '../../self-disposal/self-disposal.store'
import { useDisposalInstructionCreateMutation } from './disposal-instruction-create.mutation'
import { disposalInstructionCreateFormSchema } from './disposal-instruction-create.schema'
import { DisposalInstructionCreateFormValues } from './disposal-instruction-create.type'
import { BatchQtyFormValues } from './use-cases/fill-batch-qty-form/batch-qty-form.type'
import { ConfirmationFormValues } from './use-cases/fill-confirmation-form/confirmation-form.type'
import { useConfirmationForm } from './use-cases/fill-confirmation-form/useConfirmationForm'

type DisposalInstructionCreateContextValue = {
  form: {
    values: DisposalInstructionCreateFormValues.Root
    methods: UseFormReturn<DisposalInstructionCreateFormValues.Root>
    errors: FieldErrors<DisposalInstructionCreateFormValues.Root>
    reset: () => void
    submit: () => void
    clean: (callback: () => void) => void
    isDisposalDetailFilled: boolean
  }
  submitBatchQtyForm: (
    disposalItemIndex: number,
    values: BatchQtyFormValues
  ) => void
  submitConfirmationForm: (values: ConfirmationFormValues) => void
}

export const DisposalInstructionCreateContext = createContext<
  DisposalInstructionCreateContextValue | undefined
>(undefined)

export const DisposalInstructionCreateProvider = ({
  children,
}: PropsWithChildren) => {
  const { t } = useTranslation([
    'common',
    'disposalInstructionCreate',
    'reconciliation',
  ])

  const user = getUserStorage()
  const program = getProgramStorage()

  const resetModal = useModalResetStore()
  const modalWarningItemStore = useModalWarningItemStore()

  const confirmationForm = useConfirmationForm()

  const methods = useForm<DisposalInstructionCreateFormValues.Root>({
    defaultValues: {
      entity:
        user?.role === USER_ROLE.MANAGER
          ? {
              label: user.entity.name,
              value: program.entity_id,
            }
          : null,
      activity: null,
      instruction_type: null,
      disposal_items: [],
      bast_no: null,
      disposal_comments: null,
    },
    resolver: yupResolver(disposalInstructionCreateFormSchema(t)),
  })

  const mutation = useDisposalInstructionCreateMutation()

  useSetLoadingPopupStore(mutation.isPending)

  const disposalItemsFieldArray = useFieldArray({
    control: methods.control,
    name: 'disposal_items',
  })

  const handleSubmitBatchQtyForm = (
    disposalItemIndex: number,
    values: BatchQtyFormValues
  ) => {
    disposalItemsFieldArray.update(disposalItemIndex, values)
    methods.trigger()
  }

  const isDisposalDetailFilled = useMemo(() => {
    return (
      Boolean(methods.watch('entity')) &&
      Boolean(methods.watch('activity')) &&
      Boolean(methods.watch('instruction_type'))
    )
  }, [methods.watch()])

  const handleResetForm = () => resetModal.setModalReset(true)

  const handleSubmitConfirmationForm = (values: ConfirmationFormValues) => {
    methods.setValue('bast_no', values.bast_no)
    methods.setValue('disposal_comments', values.disposal_comments)
    mutation.mutate(methods.watch())
  }

  const handleSubmitForm = () => confirmationForm.modal.show()

  const handleCleanForm = (callback: () => void) => {
    if (isDisposalDetailFilled && methods.watch('disposal_items').length > 0) {
      modalWarningItemStore.setContent({
        title: t('reconciliation:create.change_dialog.question_material'),
        description: t('reconciliation:create.change_dialog.description'),
      })
      modalWarningItemStore.setModalRemove(true)
      modalWarningItemStore.setCustomFunction(() => callback())
    } else {
      callback()
    }
  }

  return (
    <DisposalInstructionCreateContext.Provider
      value={{
        form: {
          values: methods.watch(),
          methods,
          errors: methods.formState.errors,
          reset: handleResetForm,
          submit: () => methods.handleSubmit(handleSubmitForm)(),
          clean: handleCleanForm,
          isDisposalDetailFilled,
        },
        submitBatchQtyForm: handleSubmitBatchQtyForm,
        submitConfirmationForm: handleSubmitConfirmationForm,
      }}
    >
      {children}
    </DisposalInstructionCreateContext.Provider>
  )
}

DisposalInstructionCreateContext.displayName =
  'DisposalInstructionCreateContext'

export const useDisposalInstructionCreate = () => {
  const context = useContext(DisposalInstructionCreateContext)

  if (!context) {
    throw new Error(
      'useDisposalInstructionCreate must be used within a DisposalInstructionCreateProvider'
    )
  }

  return context
}

export const DisposalInstructionCreateConsumer = ({
  children,
}: {
  children: (value: DisposalInstructionCreateContextValue) => React.ReactNode
}) => {
  const disposalInstructionCreate = useDisposalInstructionCreate()
  return children(disposalInstructionCreate)
}
