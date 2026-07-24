import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useDebounce } from '#hooks/useDebounce'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  createEntityCustomer,
  exportEntityCustomer,
  getEntityCustomer,
  GetEntityCustomersResponse,
  getEntityVendor,
  GetEntityVendorsResponse,
  TPayloadEntityCustomerInput,
  updateEntityCustomer,
} from '#services/entity'
import { ErrorResponse } from '#types/common'
import type { TDetailEntity, TEntityCustomer } from '#types/entity'
import { getUserStorage } from '#utils/storage/user'
import { AxiosError } from 'axios'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { customerSchema } from '../../schema/EntitySchemaForm'
import { IS_CONSUMPTION } from '../../utils/constants'
import EntityDetailCustomerVendorContext from '../../utils/entity-detail-customer-vendor-context'
import { entityCustomerConsumptionType } from '../../utils/helper'
import EntityDetailCustomerTable from '../EntityDetailCustomerTable'
import EntityDetailCustomerVendorTemplateImporting from '../EntityDetailCustomerVendorTemplateImporting'
import EntityDetailLabel from '../EntityDetailLabel'
import EntityDetailModalSetDistributionCustomer from '../EntityDetailModalSetDistributionCustomer'

type Props = {
  entity?: TDetailEntity
}

export type PayloadEntityCustomer = {
  keyword?: string
  page: number
  paginate: number
}

export type TPayloadEntityCustomerVendor = {
  [key: string]: PayloadEntityCustomer
}

export type THandleOpenModal = {
  data?: TEntityCustomer | null
  isConsumptionArg?: IS_CONSUMPTION
  page?: number
}

const EntityDetailCustomerVendorContent: React.FC<Props> = ({
  entity,
}): JSX.Element => {
  const router = useRouter()
  const { id } = router.query
  const user = getUserStorage()
  const { t } = useTranslation(['entity', 'user', 'common'])

  const [openDistributionCustomerModal, setOpenDistributionCustomerModal] =
    useState(false)
  const [modalData, setModalData] = useState<TEntityCustomer | null>(null)
  const [isConsumption, setIsConsumption] = useState<IS_CONSUMPTION>(
    IS_CONSUMPTION.FALSE
  )

  const [payload, setPayload] = useState<TPayloadEntityCustomerVendor>({
    customer_consumption: {
      page: 1,
      keyword: '',
      paginate: 10,
    },
    customer_distribution: {
      page: 1,
      keyword: '',
      paginate: 10,
    },
    vendor: {
      page: 1,
      keyword: '',
      paginate: 10,
    },
  })

  const customerConsumptionKeyword = useDebounce(
    payload.customer_consumption.keyword,
    500
  )

  const customerDistributionKeyword = useDebounce(
    payload.customer_distribution.keyword,
    500
  )

  const vendorKeyword = useDebounce(payload.vendor.keyword, 500)

  const handleOpenModal = ({
    data = null,
    isConsumptionArg = 0,
  }: THandleOpenModal) => {
    setModalData(data)
    setOpenDistributionCustomerModal(true)
    setIsConsumption(isConsumptionArg)
    methods?.setValue('is_consumption', isConsumptionArg)
  }

  const queryClient = useQueryClient()

  const methods = useForm<TPayloadEntityCustomerInput>({
    resolver: yupResolver(customerSchema(t)),
    mode: 'onChange',
    defaultValues: {
      is_consumption: isConsumption,
      customers: [],
    },
  })

  const { handleSubmit } = methods

  const { fields: inputFields } = useFieldArray({
    control: methods.control,
    name: 'customers',
  })

  const { mutate: mutateInputCustomer, isPending: isProcessing } = useMutation({
    mutationFn: (inputData: TPayloadEntityCustomerInput) =>
      modalData === null
        ? createEntityCustomer(id as string, inputData)
        : updateEntityCustomer(id as string, inputData),
    onSuccess: async () => {
      toast.success({
        description: t('entity:form.success.success_update_customer', {
          customerType: entityCustomerConsumptionType(t, isConsumption),
        }),
      })
      setOpenDistributionCustomerModal(false)
      await queryClient.invalidateQueries({
        queryKey: ['entity__customer_consumption'],
      })
      queryClient.invalidateQueries({
        queryKey: ['entity__customer_distribution'],
      })
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response =
          (error.response?.data as ErrorResponse) || error?.message
        toast.danger({ description: response.message })
      }
    },
  })

  const {
    data: entityCustomerConsumption,
    isLoading: isLoadingEntityCustomerConsumption,
  } = useQuery({
    queryKey: [
      'entity__customer_consumption',
      {
        ...payload.customer_consumption,
        keyword: customerConsumptionKeyword,
        is_consumption: IS_CONSUMPTION.TRUE,
      },
    ],
    queryFn: () =>
      getEntityCustomer(id as string, {
        ...payload.customer_consumption,
        keyword: customerConsumptionKeyword,
        is_consumption: IS_CONSUMPTION.TRUE,
      }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

  const {
    data: entityCustomerDistribution,
    isLoading: isLoadingEntityCustomerDistribution,
  } = useQuery({
    queryKey: [
      'entity__customer_distribution',
      {
        ...payload.customer_distribution,
        keyword: customerDistributionKeyword,
        is_consumption: IS_CONSUMPTION.FALSE,
      },
    ],
    queryFn: () =>
      getEntityCustomer(id as string, {
        ...payload.customer_distribution,
        keyword: customerDistributionKeyword,
        is_consumption: IS_CONSUMPTION.FALSE,
      }),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

  const {
    mutate: mutateExportEntityCustomer,
    isPending: isLoadingExportEntityCustomer,
  } = useMutation({
    mutationFn: (isConsumption: number) => {
      const keyword =
        isConsumption === IS_CONSUMPTION.TRUE
          ? customerConsumptionKeyword
          : customerDistributionKeyword

      return exportEntityCustomer(id as string, {
        keyword,
        is_consumption: isConsumption,
      })
    },
    onError: (res) => toast.danger({ description: res.message }),
  })

  const { data: entityVendors, isLoading: isLoadingEntityVendor } = useQuery({
    queryKey: [
      'entity-vendor',
      {
        ...payload.vendor,
        keyword: vendorKeyword,
      },
    ],
    queryFn: () => getEntityVendor(id as string, payload.vendor),
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

  useSetLoadingPopupStore(
    isLoadingEntityCustomerConsumption ||
      isLoadingEntityCustomerDistribution ||
      isLoadingEntityVendor ||
      isLoadingExportEntityCustomer ||
      isProcessing
  )

  const contextValue = useMemo(
    () => ({
      isLoadingExport: isLoadingExportEntityCustomer,
      isSubmittingCustomer: isProcessing,
      payload,
      setPayload,
      isViewOnly: Boolean(user?.view_only),
      handleOpenModal,
      inputFields,
      methods,
      entity: entity || null,
    }),
    [
      isLoadingExportEntityCustomer,
      isProcessing,
      payload,
      setPayload,
      user?.view_only,
      handleOpenModal,
      inputFields,
      methods,
      entity,
    ]
  )

  return (
    <EntityDetailCustomerVendorContext.Provider value={contextValue}>
      <EntityDetailModalSetDistributionCustomer
        open={openDistributionCustomerModal}
        setModal={setOpenDistributionCustomerModal}
        entity={entity as TDetailEntity}
        isConsumption={isConsumption}
        modalData={modalData}
        onSubmit={handleSubmit((data) => mutateInputCustomer(data))}
        isProcessing={isProcessing}
      />
      <EntityDetailLabel
        title={t('entity:list.column.name')}
        subTitle={entity?.name}
      />

      <div className="ui-pt-[30px]">
        <div className="ui-w-full ui-flex ui-justify-between ui-items-center">
          <h5 className="ui-mb-4 ui-font-bold ui-w-auto ui-text-[20px] ui-leading-[28px]">
            {t('entity:detail.customer_vendor.customer')}
          </h5>
          {Boolean(user?.view_only) === false ? (
            <EntityDetailCustomerVendorTemplateImporting
              entityId={id as string}
            />
          ) : null}
        </div>
        <EntityDetailCustomerTable
          isLoading={isLoadingEntityCustomerDistribution}
          dataFetched={entityCustomerDistribution as GetEntityCustomersResponse}
          title={t(
            'entity:detail.information.table_title.distribution_customer'
          )}
          exportClickFunction={() =>
            mutateExportEntityCustomer(IS_CONSUMPTION.FALSE)
          }
          dataKey="customer_distribution"
        />

        <EntityDetailCustomerTable
          isLoading={isLoadingEntityCustomerConsumption}
          dataFetched={entityCustomerConsumption as GetEntityCustomersResponse}
          title={t(
            'entity:detail.information.table_title.consumption_customer'
          )}
          exportClickFunction={() =>
            mutateExportEntityCustomer(IS_CONSUMPTION.TRUE)
          }
          dataKey="customer_consumption"
        />

        <h5 className="ui-mb-4 ui-font-bold ui-w-auto ui-text-[20px] ui-leading-[28px] ui-mt-[24px]">
          {t('entity:detail.information.table_title.vendor')}
        </h5>
        <EntityDetailCustomerTable
          isLoading={isLoadingEntityVendor}
          dataFetched={entityVendors as GetEntityVendorsResponse}
          title={t('entity:detail.information.table_title.vendor')}
          dataKey="vendor"
        />
      </div>
    </EntityDetailCustomerVendorContext.Provider>
  )
}

export default EntityDetailCustomerVendorContent
