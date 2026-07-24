import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { OptionType } from '#components/react-select'
import { useProgram } from '#hooks/program/useProgram'
import { hasPermission, usePermission } from '#shared/permission/index'
import { getUserStorage } from '#utils/storage/user'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formSchema } from '../schema/TransactionCreateSchemaForm'
import {
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LIST,
} from '../transaction-create.constant'
import { CreateTransctionForm } from '../transaction-create.type'
import { useCreateTransactionSubmitAddStock } from '../TransactionAddStock/hooks/useCreateTransactionSubmitAddStock'
import { formSchemaAddStock } from '../TransactionAddStock/schema/TransactionCreateAddStockSchemaForm'
import { useTransactionSubmitCancelDiscard } from '../TransactionCancelDiscard/hooks/useTransactionSubmitCancelDiscard'
import { useTransactionCreateConsumptionSubmit } from '../TransactionConsumption/hooks/useTransactionCreateConsumptionSubmit'
import { formSchemaConsumption } from '../TransactionConsumption/schema/TransactionCreateConsumptionSchemaForm'
import { CreateTransactionConsumption } from '../TransactionConsumption/transaction-consumption.type'
import { useTransactionSubmitDiscard } from '../TransactionDiscard/hooks/useTransactionSubmitDiscard'
import { useTransactionCreateRemoveStock } from '../TransactionRemoveStock/hooks/useTransactionCreateRemoveStock'
import {
  CreateTransactionRemoveForm,
  CreateTransactionRemoveSubmit,
} from '../TransactionRemoveStock/transaction-remove-stock.type'
import { transactionRemoveStockValidation } from '../TransactionRemoveStock/transaction-remove-stock.validation-schema'
import { useTransactionCreateReturnFromFacility } from '../TransactionReturnFromFacility/hooks/useTransactionCreateReturnFromFacility'
import {
  CreateTransactionReturnFromFacilityForm,
  CreateTransactionReturnFromFacilitySubmit,
} from '../TransactionReturnFromFacility/transaction-return-from-facility.type'
import { transactionReturnFromFacilityValidation } from '../TransactionReturnFromFacility/transaction-return-from-facility.validation-schema'
import useTransactionCreateTransferStockSubmit from '../TransactionTransferStock/hooks/useTransactionCreateTransferStockSubmit'
import { formSchemaTransferStock } from '../TransactionTransferStock/schema/TransactionCreateTransferStockSchemaForm'
import { CreateTransactionTransferStock } from '../TransactionTransferStock/transaction-transfer-stock.type'
import { handleDefaultValue } from '../utils/helper'

export const useCreateTransaction = () => {
  usePermission('transaction-create')
  const {
    t,
    i18n: { language },
  } = useTranslation([
    'transactionCreate',
    'common',
    'transactionCreateAddStock',
  ])
  const { query, push, replace } = useRouter()
  const { type } = query
  const isSuperAdmin = hasPermission('transaction-enable-select-entity')
  const userStorage = getUserStorage()
  const { activeProgram } = useProgram()
  const isTransferStockRestricted =
    activeProgram?.config.transaction?.is_transfer_stock_restricted ?? true
  const [modalAcknowledge, setModalAcknowledge] = useState(false)

  useEffect(() => {
    if (!type) {
      push(`/${language}/404`)
      return
    }
    if (
      isTransferStockRestricted &&
      Number(type) === TRANSACTION_TYPE.TRANSFER_STOCK
    ) {
      replace(`/${language}/404`)
    }

    const typeValue = TRANSACTION_TYPE_LIST(t).find(
      (i) => i.id === Number(type)
    )
    if (!typeValue) push(`/${language}/404`)
  }, [query, isTransferStockRestricted])

  const changeSchemaBasedOnTransactionType = (transaction_type_id: number) => {
    if (transaction_type_id === TRANSACTION_TYPE.REMOVE_STOCK) {
      return transactionRemoveStockValidation(t)
    }
    if (transaction_type_id === TRANSACTION_TYPE.ADD_STOCK) {
      return formSchemaAddStock(t)
    }
    if (
      transaction_type_id === TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES
    ) {
      return transactionReturnFromFacilityValidation(t)
    }
    if (transaction_type_id === TRANSACTION_TYPE.LAST_MILE) {
      return formSchemaConsumption(t)
    }
    if (transaction_type_id === TRANSACTION_TYPE.TRANSFER_STOCK) {
      return formSchemaTransferStock(t)
    }
    return formSchema(t)
  }

  const methods = useForm<CreateTransctionForm>({
    resolver: yupResolver(changeSchemaBasedOnTransactionType(Number(type))),
    mode: 'onChange',
    defaultValues: handleDefaultValue(
      t,
      Number(type),
      isSuperAdmin
        ? null
        : ({
            label: userStorage?.entity?.name,
            value: activeProgram?.entity_id,
          } as OptionType)
    ),
  })
  const { handleSubmit, reset, setError } = methods

  const { submitAddStock } = useCreateTransactionSubmitAddStock()
  const { submitDiscard } = useTransactionSubmitDiscard()
  const { mutateRemove } = useTransactionCreateRemoveStock(t)
  const { mutateReturnFromFacility } = useTransactionCreateReturnFromFacility(t)
  const { submitConsumption } = useTransactionCreateConsumptionSubmit({
    setError,
  })
  const { submitCancelDiscard } = useTransactionSubmitCancelDiscard()
  const {
    submitTransferStock,
    showModalNeedRelation,
    setShowModalNeedRelation,
    needRelationData,
  } = useTransactionCreateTransferStockSubmit()

  const onValid: SubmitHandler<CreateTransctionForm> = (formData) => {
    switch (Number(type)) {
      case TRANSACTION_TYPE.REMOVE_STOCK:
        return mutateRemove(
          formData as CreateTransactionRemoveForm &
            CreateTransactionRemoveSubmit
        )
      case TRANSACTION_TYPE.DISCARD:
        submitDiscard(formData)
        break
      case TRANSACTION_TYPE.ADD_STOCK:
        submitAddStock({ formData })
        break
      case TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES:
        mutateReturnFromFacility(
          formData as CreateTransactionReturnFromFacilityForm &
            CreateTransactionReturnFromFacilitySubmit
        )
        break
      case TRANSACTION_TYPE.LAST_MILE:
        submitConsumption({
          formData: formData as CreateTransactionConsumption,
        })
        break
      case TRANSACTION_TYPE.CANCELLATION_OF_DISCARD:
        submitCancelDiscard(formData)
        break
      case TRANSACTION_TYPE.TRANSFER_STOCK:
        if (modalAcknowledge) {
          setModalAcknowledge(false)
          submitTransferStock({
            formData: formData as CreateTransactionTransferStock,
          })
        } else {
          setModalAcknowledge(true)
        }
        break
      default:
        return
    }
  }

  const handleTitle = () =>
    TRANSACTION_TYPE_LIST(t).find((i) => i.id === Number(type))

  const handleTitleTable = () => {
    if (TRANSACTION_TYPE.CANCELLATION_OF_DISCARD === Number(type)) {
      return t(
        'transactionCreate:cancel_transaction_discard.table.discard.title'
      )
    }
    if (TRANSACTION_TYPE.RETURN_FROM_HEALTH_FACILITIES === Number(type)) {
      return t(
        'transactionCreate:transaction_return_from_facility.title_table'
      )
    }
    return t('transactionCreate:transaction_table')
  }

  return {
    methods,
    onSubmit: handleSubmit(onValid),
    reset,
    handleTitle,
    type,
    titleTable: handleTitleTable(),
    isSuperAdmin,
    modalAcknowledge,
    setModalAcknowledge,
    showModalNeedRelation,
    setShowModalNeedRelation,
    needRelationData,
  }
}
