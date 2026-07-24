import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { useLoadingPopupStore } from '#store/loading.store'
import { UseFormReturn } from 'react-hook-form'

import ticketingSystemCreateService, {
  TicketingSystemCreateTicketRequest,
} from '../../ticketing-system-create.service'
import { TicketingSystemCreateFormValues } from '../../ticketing-system-create.type'
import useTicketingSystemCreateSubmitFormStore from './ticketing-system-create-submit-form.store'

type UseTicketingSystemCreateSubmitFormStore = {
  form: UseFormReturn<TicketingSystemCreateFormValues>
}

const useTicketingSystemCreateSubmitForm = ({
  form,
}: UseTicketingSystemCreateSubmitFormStore) => {
  const { setLoadingPopup } = useLoadingPopupStore()
  const router = useSmileRouter()

  const { isSubmitFormModalOpen, setIsSubmitFormModalOpen } =
    useTicketingSystemCreateSubmitFormStore()

  const mutation = useMutation({
    mutationFn: ticketingSystemCreateService.createTicket,
    onSuccess: (response) => {
      setLoadingPopup(false)
      setIsSubmitFormModalOpen(false)
      router.push(`/v5/ticketing-system/${response.id}`)
    },
    onError: (error: Error) => {
      setLoadingPopup(false)
      toast.danger({ description: error.message })
    },
  })

  const handleSubmit = (values: TicketingSystemCreateFormValues) => {
    setLoadingPopup(true)

    switch (true) {
      case !values.entity:
        throw new Error('entity is required')
      case !values.arrived_date:
        throw new Error('arrived_date is required')
    }

    const payload: TicketingSystemCreateTicketRequest = {
      entity_id: Number(values.entity?.value),
      has_order: Number(values.has_order) === 1 ? 1 : 0,
      order_id: values.order_id?.value ?? null,
      do_number: values.do_number || null,
      arrived_date: values.arrived_date,
      items: values.selected_materials
        .map((selectedMaterial) => {
          return selectedMaterial.items?.map((item) => {
            switch (true) {
              case !item.expired_date:
                throw new Error('expired_date is required for each item')
              case !item.qty:
                throw new Error('qty is required for each item')
              case !item.reason:
                throw new Error('reason is required for each item')
              case !item.child_reason:
                throw new Error('child_reason is required for each item')
            }

            return {
              material_id: selectedMaterial.material?.id || null,
              custom_material: selectedMaterial.custom_material?.name || null,
              batch_code: item.batch_code || null,
              expired_date: item.expired_date,
              production_date: null,
              qty: item.qty,
              reason_id: item.reason?.value,
              child_reason_id: item.child_reason?.value,
            }
          })
        })
        .flat(),
      comment: values.comment || null,
    }

    mutation.mutate(payload)
  }

  return {
    modal: {
      isOpen: isSubmitFormModalOpen,
      open: () => setIsSubmitFormModalOpen(true),
      close: () => setIsSubmitFormModalOpen(false),
    },
    submit: () => handleSubmit(form.getValues()),
  }
}

export default useTicketingSystemCreateSubmitForm
