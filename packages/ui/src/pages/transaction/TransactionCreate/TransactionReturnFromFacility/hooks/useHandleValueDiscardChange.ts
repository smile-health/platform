import { useContext } from 'react'
import { TFunction } from 'i18next'

import TransactionReturnFromFacilityContext from '../transaction-return-from-facility.context'
import { TTransactionReturnFacilityConsumptionData } from '../transaction-return-from-facility.type'
import { transactionReturnFromFacilityDiscardValidation } from '../transaction-return-from-facility.validation-schema'

export const useHandleValueDiscardChange = (
  t: TFunction<['transactionCreate', 'common']>
) => {
  const { setErrorForms } = useContext(TransactionReturnFromFacilityContext)
  const validateField = async (
    fieldName: string,
    updatedDiscardStock: TTransactionReturnFacilityConsumptionData
  ) => {
    const schema = transactionReturnFromFacilityDiscardValidation(t)
    try {
      await schema.validateAt(fieldName, updatedDiscardStock)
      setErrorForms((prev: any) => ({
        ...prev,
        [fieldName]: null,
      }))
    } catch (err: any) {
      setErrorForms((prev: any) => ({
        ...prev,
        [fieldName]: err.message,
      }))
    }
  }
  const handleErrorDiscard = async ({
    name,
    updatedDiscardStock,
  }: {
    name: string
    requiredSubstitution?: boolean
    updatedDiscardStock: TTransactionReturnFacilityConsumptionData
  }) => {
    await validateField(name, updatedDiscardStock)

    const pair = {
      discard_open_vial_qty: 'discard_qty',
      discard_qty: 'discard_open_vial_qty',
    } as const

    if (name in pair) {
      await validateField(pair[name as keyof typeof pair], updatedDiscardStock)
    }
  }

  return {
    handleErrorDiscard,
  }
}
