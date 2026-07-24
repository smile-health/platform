import { useEffect, useMemo } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useQuery } from '@tanstack/react-query'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TicketingSystemCreateSelectedMaterial } from '../../ticketing-system-create.type'
import ticketingSystemCreateAddQtyItemSchema from './ticketing-system-create-add-qty-item.schema'
import { getTicketingSystemReasons } from './ticketing-system-create-add-qty-item.service'
import useTicketingSystemCreateAddQtyItemStore from './ticketing-system-create-add-qty-item.store'

const useTicketingSystemCreateAddQtyItem = () => {
  const { t, i18n } = useTranslation('ticketingSystemCreate')
  const { selectedMaterialRow, action, ...states } =
    useTicketingSystemCreateAddQtyItemStore()

  const reasonOptionsQuery = useQuery({
    queryKey: [i18n.language, 'ticketing-system', 'reason-options'],
    queryFn: async () => getTicketingSystemReasons(),
    select: (data) => {
      return data.map((reason) => ({
        label: reason.title,
        value: reason.id,
        child: reason.child.map((child) => ({
          label: child.title,
          value: child.id,
        })),
      }))
    },
  })

  const defaultValues: TicketingSystemCreateSelectedMaterial = useMemo(
    () => ({
      material: selectedMaterialRow?.original.material ?? null,
      custom_material: selectedMaterialRow?.original.custom_material ?? null,
      items:
        selectedMaterialRow?.original.items &&
        selectedMaterialRow?.original.items.length > 0
          ? selectedMaterialRow?.original.items
          : [
              {
                batch_code: null,
                expired_date: null,
                production_date: null,
                qty: null,
                reason: null,
                child_reason: null,
              },
            ],
    }),
    [states, selectedMaterialRow]
  )

  const form = useForm<TicketingSystemCreateSelectedMaterial>({
    values: defaultValues,
    defaultValues,
    resolver: yupResolver(ticketingSystemCreateAddQtyItemSchema(t)),
    mode: 'onChange',
  })

  const handleEmptyAllValues = () => {
    form.reset({
      material: null,
      custom_material: null,
      items: [
        {
          batch_code: null,
          expired_date: null,
          production_date: null,
          qty: null,
          reason: null,
          child_reason: null,
        },
      ],
    })
  }

  const handleCloseDrawer = () => {
    handleEmptyAllValues()
    states.closeDrawer()
  }

  useEffect(() => {
    if (action === 'add') {
      form.reset({
        material: selectedMaterialRow?.original.material ?? null,
        custom_material: selectedMaterialRow?.original.custom_material ?? null,
        items: [
          {
            batch_code: null,
            expired_date: null,
            production_date: null,
            qty: null,
            reason: null,
            child_reason: null,
          },
        ],
      })
    }
  }, [action, selectedMaterialRow, form.getValues])

  return {
    selectedMaterialRow,
    ...states,
    closeDrawer: handleCloseDrawer,
    emptyAllVallues: handleEmptyAllValues,
    form,
    reasonOptionsQuery,
  }
}

export default useTicketingSystemCreateAddQtyItem
