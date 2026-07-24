import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Row } from '@tanstack/react-table'
import DistributionDisposalModalWarningItem from '#pages/disposal/distribution-disposal/components/DistributionDisposalModalWarningItem'
import { FieldErrors, useForm, UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../../../transaction/TransactionCreate/store/modal-warning.store'
import { DisposalInstructionCreateFormValues } from '../../disposal-instruction-create.type'
import { FORM_VALIDATION_TYPE } from './batch-qty-form.constants'
import { batchQtyFormSchema } from './batch-qty-form.schema'
import { BatchQtyFormValues } from './batch-qty-form.type'

type BatchQtyFormContextValue = {
  data: {
    selectedDisposalItemIndex?: number
    selectedDisposalItem?: DisposalInstructionCreateFormValues.DisposalItem
  }
  methods: UseFormReturn<BatchQtyFormValues>
  drawer: {
    isOpen: boolean
    open: (
      selectedDisposalItemRow: Row<DisposalInstructionCreateFormValues.DisposalItem>
    ) => void
    close: () => void
  }
  errors: FieldErrors<BatchQtyFormValues>
  empty: () => void
  reset: () => void
}

const BatchQtyFormContext = createContext<BatchQtyFormContextValue | undefined>(
  undefined
)

export const BatchQtyFormProvider = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation(['common', 'disposalInstructionCreate'])

  const { setModalWarning } = useModalWarningStore()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedDisposalItemRow, setSelectedDisposalItemRow] =
    useState<Row<DisposalInstructionCreateFormValues.DisposalItem>>()

  const selectedDisposalItem = selectedDisposalItemRow?.original
  const initialValue = useMemo(
    () => ({
      ...selectedDisposalItem,
      stocks:
        selectedDisposalItem?.stocks.map((stock) => ({
          ...stock,
          disposal_stocks:
            stock.disposal_stocks?.map((disposalStock) => ({
              ...disposalStock,
              discard_qty: null,
              received_qty: null,
            })) ?? [],
        })) ?? [],
    }),
    [selectedDisposalItem]
  )

  const batchQtyFormMethods = useForm<BatchQtyFormValues>({
    mode: 'onChange',
    defaultValues: selectedDisposalItem,
    resolver: yupResolver(batchQtyFormSchema(t)),
  })

  const batchQtyFormErrors = batchQtyFormMethods.formState.errors

  const handleEmptyForm = () => batchQtyFormMethods.reset(initialValue)

  const handleResetForm = () => batchQtyFormMethods.reset(selectedDisposalItem)

  const handleCloseDrawer = () => {
    handleEmptyForm()
    setSelectedDisposalItemRow(undefined)
    setIsDrawerOpen(false)
  }

  useEffect(() => {
    if (
      batchQtyFormErrors?.stocks?.root?.type ===
      FORM_VALIDATION_TYPE.at_least_one_qty
    ) {
      setModalWarning(
        true,
        t('disposalInstructionCreate:form.validation.stock_at_least_one_qty')
      )
    }
  }, [batchQtyFormErrors])

  return (
    <BatchQtyFormContext.Provider
      value={{
        data: {
          selectedDisposalItemIndex: selectedDisposalItemRow?.index,
          selectedDisposalItem,
        },
        methods: batchQtyFormMethods,
        drawer: {
          isOpen: isDrawerOpen,
          open: (selectedDisposalItem) => {
            batchQtyFormMethods.reset(selectedDisposalItem.original)
            setSelectedDisposalItemRow(selectedDisposalItem)
            setIsDrawerOpen(true)
          },
          close: handleCloseDrawer,
        },
        errors: batchQtyFormErrors,
        empty: handleEmptyForm,
        reset: handleResetForm,
      }}
    >
      <DistributionDisposalModalWarningItem />
      {children}
    </BatchQtyFormContext.Provider>
  )
}

export const useBatchQtyForm = () => {
  const context = useContext(BatchQtyFormContext)

  if (!context) {
    throw new Error(
      'useBatchQtyFormCreateForm must be used within a BatchQtyFormProvider'
    )
  }

  return context
}
