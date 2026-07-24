import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import Error403Page from '#pages/error/Error403Page'
import Error404Page from '#pages/error/Error404Page'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import {
  FieldErrors,
  useFieldArray,
  UseFieldArrayReturn,
  useForm,
  UseFormReturn,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { DELIVERY_TYPE } from '../detail/annual-commitment-detail.constant'
import { detailAnnualCommitment } from '../detail/annual-commitment-detail.service'
import { dateToCalendarDate } from './annual-commitment-form.helper'
import { annualCommitmentFormSchema } from './annual-commitment-form.schema'
import {
  createAnnualCommitment,
  updateAnnualCommitment,
} from './annual-commitment-form.service'
import {
  AnnualCommitmentFormPayload,
  AnnualCommitmentFormValues,
  BufferItem,
  CentralAllocationItem,
} from './annual-commitment-form.type'

type AnnualCommitmentFormContextValue = {
  mode: 'create' | 'edit'
  form: {
    values: AnnualCommitmentFormValues
    methods: UseFormReturn<AnnualCommitmentFormValues>
    errors: FieldErrors<AnnualCommitmentFormValues>
    reset: () => void
    submit: () => void
  }
  centralAllocations: UseFieldArrayReturn<
    AnnualCommitmentFormValues,
    'centralAllocations'
  >
  bufferItems: UseFieldArrayReturn<AnnualCommitmentFormValues, 'bufferItems'>
  addCentralAllocation: (item: CentralAllocationItem) => void
  addBufferItem: (item: BufferItem) => void
  removeCentralAllocation: (index: number) => void
  removeBufferItem: (index: number) => void
  isLoading: boolean
  error?: AxiosError<ErrorResponse>
  showNoMaterialModal: boolean
  setShowNoMaterialModal: Dispatch<SetStateAction<boolean>>
  confirmSubmitWithoutMaterial: () => void
}

export const AnnualCommitmentFormContext = createContext<
  AnnualCommitmentFormContextValue | undefined
>(undefined)

export const AnnualCommitmentFormProvider = ({
  children,
}: PropsWithChildren) => {
  const { t } = useTranslation(['common', 'annualCommitmentForm'])
  const router = useSmileRouter()
  const id = router.query.id
  const { setLoadingPopup } = useLoadingPopupStore()

  const { data, isLoading, error } = useQuery({
    queryKey: ['annualCommitmentDetail'],
    queryFn: () => detailAnnualCommitment(Number(id)),
    enabled: !!id,
  })

  const mode = router.query.id ? 'edit' : 'create'

  const [showNoMaterialModal, setShowNoMaterialModal] = useState(false)

  const centralAllocationsData = useMemo(
    () =>
      data?.items
        ?.filter((item) => item.delivery_type?.id === DELIVERY_TYPE.Allocation)
        ?.map((item) => ({
          id: item.id,
          material: {
            value: item.material?.id,
            label: item.material?.name,
          },
          provinceReceiver: {
            value: item.province?.id,
            label: item.province?.name,
          },
          numberVial: item.vial_quantity,
          numberDose: item.dose_quantity,
          piecesPerUnit: (item.dose_quantity ?? 1) / (item.vial_quantity ?? 1),
        })),
    [data?.items]
  )

  const bufferItemsData = useMemo(
    () =>
      data?.items
        ?.filter((item) => item.delivery_type?.id === DELIVERY_TYPE.Buffer)
        ?.map((item) => ({
          id: item.id,
          material: {
            value: item.material?.id,
            label: item.material?.name,
          },
          numberVial: item.vial_quantity,
          numberDose: item.dose_quantity,
          piecesPerUnit: (item.dose_quantity ?? 1) / (item.vial_quantity ?? 1),
        })),
    [data?.items]
  )

  const { mutate } = useMutation<
    unknown,
    AxiosError<ErrorResponse>,
    AnnualCommitmentFormPayload
  >({
    mutationKey: ['annualCommitment', 'detail', 'createOrUpdate'],
    mutationFn: (values: AnnualCommitmentFormPayload) => {
      if (!id) {
        return createAnnualCommitment(values)
      }
      return updateAnnualCommitment(Number(id), values)
    },
    onSuccess: async () => {
      setLoadingPopup(false)
      toast.success({
        description: id
          ? t('common:message.success.update', {
              type: t('annualCommitmentForm:page.title.label').toLowerCase(),
            })
          : t('common:message.success.create', {
              type: t('annualCommitmentForm:page.title.label').toLowerCase(),
            }),
      })
      router.push('/v5/annual-commitment')
    },
    onError: (error: AxiosError) => {
      setLoadingPopup(false)
      const { message, errors } = error?.response?.data as {
        message: string
        errors: { [key: string]: Array<string> }
      }
      toast.danger({
        description:
          message ||
          (id
            ? t('common:message.failed.update', {
                type: t('annualCommitmentForm:page.title.label').toLowerCase(),
              })
            : t('common:message.failed.create', {
                type: t('annualCommitmentForm:page.title.label').toLowerCase(),
              })),
        id: 'toast-error-create-annual-commitment',
      })
      if (errors) {
        Object.keys(errors).forEach((key) => {
          const errorKey = key as keyof AnnualCommitmentFormValues
          methods.setError(errorKey, {
            type: 'manual',
            message: errors[key]?.join(','),
          })
        })
      }
    },
  })

  const defaultValues = useMemo(() => {
    const isEdit = mode === 'edit'

    if (!isEdit) {
      return {
        contract_number: null,
        year: null,
        contract_start_date: null,
        contract_end_date: null,
        supplier: null,
        description: null,
        centralAllocations: [],
        bufferItems: [],
      }
    }

    const contract_number = data?.contract?.id
      ? { value: data.contract.id, label: data.contract.number }
      : null

    const year = data?.year
      ? { value: data.year, label: data.year.toString() }
      : null

    const contract_start_date = data?.contract_start_date
      ? new Date(data.contract_start_date)
      : null

    const contract_end_date = data?.contract_end_date
      ? new Date(data.contract_end_date)
      : null

    const supplier = data?.vendor?.id
      ? { value: data.vendor.id, label: data.vendor.name }
      : null

    const description = data?.information ?? null
    const centralAllocations = centralAllocationsData ?? []
    const bufferItems = bufferItemsData ?? []

    return {
      contract_number,
      year,
      contract_start_date,
      contract_end_date,
      supplier,
      description,
      centralAllocations,
      bufferItems,
    }
  }, [bufferItemsData, centralAllocationsData, data, mode])

  const methods = useForm<AnnualCommitmentFormValues>({
    defaultValues,
    resolver: yupResolver(annualCommitmentFormSchema(t)),
    mode: 'onChange',
  })

  useEffect(() => {
    methods.reset(defaultValues)
  }, [defaultValues])

  const centralAllocationsFieldArray = useFieldArray({
    control: methods.control,
    name: 'centralAllocations',
  })

  const bufferItemsFieldArray = useFieldArray({
    control: methods.control,
    name: 'bufferItems',
  })

  const watchedValues = methods.watch()

  const handleSubmitForm = useCallback(
    (data: AnnualCommitmentFormValues) => {
      const bufferItemsMapped = data?.bufferItems?.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        vial_quantity: item.numberVial,
        dose_quantity: item.numberDose,
        material_id: item.material?.value,
      }))

      const centralAllocationsMapped = data?.centralAllocations?.map(
        (item) => ({
          ...(item.id ? { id: item.id } : {}),
          ...(item.provinceReceiver?.value
            ? { province_id: item.provinceReceiver?.value }
            : {}),
          vial_quantity: item.numberVial,
          dose_quantity: item.numberDose,
          material_id: item.material?.value,
        })
      )

      const contract_numberLabel =
        data?.contract_number?.label.toLowerCase() ?? ''

      const payload: AnnualCommitmentFormPayload = {
        contract_number:
          contract_numberLabel.includes('create') ||
          contract_numberLabel.includes('tambah')
            ? (data?.contract_number?.value ?? undefined)
            : (data?.contract_number?.label ?? undefined),
        contract_start_date:
          dateToCalendarDate(data?.contract_start_date)?.toString() ??
          undefined,
        contract_end_date:
          dateToCalendarDate(data?.contract_end_date)?.toString() ?? undefined,
        year: data?.year?.value ?? undefined,
        vendor_id: data?.supplier?.value
          ? Number(data?.supplier?.value)
          : undefined,
        information: data?.description ?? undefined,
        items: [...bufferItemsMapped, ...centralAllocationsMapped],
      }

      setLoadingPopup(true)

      mutate(payload)
    },
    [mutate, setLoadingPopup]
  )

  const handleResetForm = useCallback(() => {
    methods.reset()
  }, [methods])

  const confirmSubmitWithoutMaterial = useCallback(() => {
    setShowNoMaterialModal(false)
    methods.handleSubmit(handleSubmitForm)()
  }, [methods, handleSubmitForm])

  const submit = useCallback(() => {
    const centralAllocationsLength =
      methods.getValues('centralAllocations')?.length ?? 0
    const bufferItemsLength = methods.getValues('bufferItems')?.length ?? 0
    const hasMaterials = centralAllocationsLength > 0 || bufferItemsLength > 0

    if (!hasMaterials) {
      methods.trigger().then((isValid) => {
        if (isValid) {
          setShowNoMaterialModal(true)
        }
      })
      return
    }

    methods.handleSubmit(handleSubmitForm)()
  }, [methods, handleSubmitForm])

  const addCentralAllocation = useCallback(
    (item: any) => {
      centralAllocationsFieldArray.append({
        material: item.material,
        provinceReceiver: null,
        numberVial: null,
        numberDose: null,
        piecesPerUnit: item?.piecesPerUnit,
      })

      if (
        methods.getValues().bufferItems.length > 0 ||
        methods.getValues().centralAllocations.length > 0
      ) {
        methods.clearErrors('centralAllocations')
        methods.clearErrors('bufferItems')
      }
    },
    [centralAllocationsFieldArray, methods]
  )

  const addBufferItem = useCallback(
    (item: any) => {
      bufferItemsFieldArray.append({
        material: item.material,
        numberVial: null,
        numberDose: null,
        piecesPerUnit: item?.piecesPerUnit,
      })

      if (
        methods.getValues().bufferItems.length > 0 ||
        methods.getValues().centralAllocations.length > 0
      ) {
        methods.clearErrors('centralAllocations')
        methods.clearErrors('bufferItems')
      }
    },
    [bufferItemsFieldArray, methods]
  )

  const removeCentralAllocation = useCallback(
    (index: number) => {
      centralAllocationsFieldArray.remove(index)
      methods.trigger('centralAllocations')
    },
    [centralAllocationsFieldArray, methods]
  )

  const removeBufferItem = useCallback(
    (index: number) => {
      bufferItemsFieldArray.remove(index)
      methods.trigger('centralAllocations')
    },
    [bufferItemsFieldArray, methods]
  )

  const contextValue = useMemo(
    () => ({
      id,
      mode,
      form: {
        values: watchedValues,
        methods,
        errors: methods.formState.errors,
        reset: handleResetForm,
        submit,
      },
      centralAllocations: centralAllocationsFieldArray,
      bufferItems: bufferItemsFieldArray,
      addCentralAllocation,
      addBufferItem,
      removeCentralAllocation,
      removeBufferItem,
      isLoading,
      error,
      showNoMaterialModal,
      setShowNoMaterialModal,
      confirmSubmitWithoutMaterial,
    }),
    [
      id,
      mode,
      watchedValues,
      methods,
      handleResetForm,
      submit,
      centralAllocationsFieldArray,
      bufferItemsFieldArray,
      addCentralAllocation,
      addBufferItem,
      removeCentralAllocation,
      removeBufferItem,
      isLoading,
      error,
      showNoMaterialModal,
      confirmSubmitWithoutMaterial,
    ]
  )

  return (
    <AnnualCommitmentFormContext.Provider
      value={contextValue as unknown as AnnualCommitmentFormContextValue}
    >
      {children}
    </AnnualCommitmentFormContext.Provider>
  )
}

AnnualCommitmentFormContext.displayName = 'AnnualCommitmentFormContext'

export const useAnnualCommitmentForm = () => {
  const context = useContext(AnnualCommitmentFormContext)

  if (!context) {
    throw new Error(
      'useAnnualCommitmentForm must be used within a AnnualCommitmentFormProvider'
    )
  }

  return context
}

export const AnnualCommitmentFormConsumer = ({
  children,
}: {
  children: (value: AnnualCommitmentFormContextValue) => React.ReactNode
}) => {
  const annualCommitmentForm = useAnnualCommitmentForm()
  const { error } = annualCommitmentForm
  if (error) {
    if (error?.response?.status === 403) return <Error403Page />
    if (error?.response?.status === 404) return <Error404Page />
    if (error?.response?.status === 422) return <Error404Page />
  }

  return children(annualCommitmentForm)
}
