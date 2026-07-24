import React, { createContext, useContext } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import ticketingSystemCreateSchema from './ticketing-system-create.schema'
import {
  TicketingSystemCreateFormValues,
  TicketingSystemCreateSelectedMaterial,
} from './ticketing-system-create.type'
import useTicketingSystemCreateAddQtyItem from './use-cases/addQtyItem/useTicketingSystemCreateAddQtyItem'
import useTicketingSystemCreateOrderDetail from './use-cases/displayOrderDetail/useTicketingSystemCreateOrderDetail'
import useTicketingSystemCreateMaterialSelection from './use-cases/materialSelection/useTicketingSystemCreateMaterialSelection'
import useTicketingSystemCreateResetForm from './use-cases/resetForm/useTicketingSystemCreateResetForm'
import useTicketingSystemCreateSubmitForm from './use-cases/submitForm/useTicketingSystemCreateSubmitForm'

type TicketingSystemCreateContextValue = {
  form: UseFormReturn<TicketingSystemCreateFormValues>
  reset: ReturnType<typeof useTicketingSystemCreateResetForm>
  submit: () => Promise<void>
  materialSelection: ReturnType<
    typeof useTicketingSystemCreateMaterialSelection
  >
  addQtyItem: ReturnType<typeof useTicketingSystemCreateAddQtyItem>
  orderDetail: ReturnType<typeof useTicketingSystemCreateOrderDetail>
  onSubmitQtyItem: (values: TicketingSystemCreateSelectedMaterial) => void
}

export const TicketingSystemCreateContext = createContext<
  TicketingSystemCreateContextValue | undefined
>(undefined)

const TicketingSystemCreateProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { t } = useTranslation('ticketingSystemCreate')
  const program = getProgramStorage()
  const user = getUserStorage()

  const form = useForm<TicketingSystemCreateFormValues>({
    defaultValues: {
      entity: {
        label: user?.entity?.name,
        value: program.entity_id,
      },
      has_order: 0,
      order_id: null,
      do_number: '',
      arrived_date: '',
      selected_materials: [],
      accept_terms: false,
      comment: '',
    },
    resolver: yupResolver(ticketingSystemCreateSchema(t)),
    mode: 'onSubmit',
  })

  const selectedMaterialsField = useFieldArray({
    control: form.control,
    name: 'selected_materials',
  })

  const orderDetail = useTicketingSystemCreateOrderDetail()
  const materialSelection = useTicketingSystemCreateMaterialSelection({ form })
  const addQtyItem = useTicketingSystemCreateAddQtyItem()
  const resetForm = useTicketingSystemCreateResetForm({ form })
  const submitForm = useTicketingSystemCreateSubmitForm({ form })

  const handleSubmitQtyItem = (
    values: TicketingSystemCreateSelectedMaterial
  ) => {
    const qtyItemIndex = addQtyItem.selectedMaterialRow?.index
    if (qtyItemIndex !== undefined) {
      selectedMaterialsField.update(qtyItemIndex, values)
    }

    addQtyItem.emptyAllVallues()
    addQtyItem.closeDrawer()
  }

  return (
    <TicketingSystemCreateContext.Provider
      value={{
        form,
        materialSelection,
        addQtyItem,
        onSubmitQtyItem: handleSubmitQtyItem,
        orderDetail,
        reset: resetForm,
        submit: form.handleSubmit(submitForm.modal.open),
      }}
    >
      {children}
    </TicketingSystemCreateContext.Provider>
  )
}

export const useTicketingSystemCreateContext = () => {
  const context = useContext(TicketingSystemCreateContext)
  if (!context) {
    throw new Error(
      'useTicketingSystemCreateContext must be used within a TicketingSystemCreateProvider'
    )
  }
  return context
}

export const TicketingSystemCreateConsumer = ({
  children,
}: {
  children: (value: TicketingSystemCreateContextValue) => React.ReactNode
}) => {
  const ticketingSystemCreate = useTicketingSystemCreateContext()
  return children(ticketingSystemCreate)
}

TicketingSystemCreateContext.displayName = 'TicketingSystemCreateContext'

export default TicketingSystemCreateProvider
