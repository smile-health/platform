import { UseFormReturn } from 'react-hook-form'

import { TicketingSystemCreateFormValues } from '../../ticketing-system-create.type'
import useTicketingSystemCreateResetFormStore from './ticketing-system-create-reset-form.store'

type UseTicketingSystemCreateResetFormStore = {
  form: UseFormReturn<TicketingSystemCreateFormValues>
}

const useTicketingSystemCreateResetForm = ({
  form,
}: UseTicketingSystemCreateResetFormStore) => {
  const { isResetFormModalOpen, setIsResetFormModalOpen } =
    useTicketingSystemCreateResetFormStore()

  return {
    modal: {
      isOpen: isResetFormModalOpen,
      open: () => setIsResetFormModalOpen(true),
      close: () => setIsResetFormModalOpen(false),
    },
    reset: () => {
      form.reset()
      setIsResetFormModalOpen(false)
    },
  }
}

export default useTicketingSystemCreateResetForm
