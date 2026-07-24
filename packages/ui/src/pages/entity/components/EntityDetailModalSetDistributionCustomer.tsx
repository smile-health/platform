import { useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Plus from '#components/icons/Plus'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import {
  listEntityActivitiesDate,
  loadEntityCustomerOptions,
  TCustomerForm,
  TPayloadEntityCustomerInput,
} from '#services/entity'
import {
  TDetailActivityDate,
  TDetailEntity,
  TEntityCustomer,
} from '#types/entity'
import { Controller, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { IS_CONSUMPTION } from '../utils/constants'
import EntityDetailCustomerVendorContext from '../utils/entity-detail-customer-vendor-context'
import { entityCustomerConsumptionType } from '../utils/helper'

type TSingleOption = { value: string | number; label: string | number } | null
type TOptions = Array<TSingleOption>
type TCustomerSelected = {
  customer: TSingleOption | null
  activity: TOptions | null
}

type Props = {
  open: boolean
  isConsumption: IS_CONSUMPTION
  setModal: (value: boolean) => void
  entity: TDetailEntity
  modalData?: TEntityCustomer | null
  onSubmit: any
  isProcessing?: boolean
}

const getUniqueActivityOptions = (
  options: TDetailActivityDate[] | undefined
) => {
  if (!options) return []
  const mappedOptions = options
    .map((option) => ({
      label: option.name ?? '',
      value: option.id ?? null,
    }))
    .filter((option) => option.label !== '' && option.value !== null)
  return mappedOptions.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.value === item.value)
  )
}

const EntityDetailModalSetDistributionCustomer: React.FC<Props> = ({
  open,
  setModal,
  isConsumption = IS_CONSUMPTION.FALSE,
  modalData = null,
  onSubmit,
  entity,
  isProcessing = false,
}) => {
  const router = useRouter()
  const { id } = router.query
  const { t } = useTranslation(['entity', 'common'])
  const { inputFields, methods } = useContext(EntityDetailCustomerVendorContext)
  const {
    setValue,
    watch,
    getValues,
    formState: { errors },
    clearErrors,
  } = methods

  const {
    data: activityOptions,
    isFetching: isLoadingActivities,
    isError: isErrorActivities,
  } = useQuery({
    queryKey: ['entity__activities_date', id],
    queryFn: () => listEntityActivitiesDate(id as string),
    enabled: !!id,
  })

  const [confirmationCloseModal, setConfirmationCloseModal] =
    useState<boolean>(false)
  const [errorCustomer, setErrorCustomer] = useState<boolean>(false)

  const isDisabledSubmitButton =
    isProcessing || errorCustomer || watch('customers')?.length === 0

  const checkCustomerExists = (value: { value: number | string }) =>
    watch('customers')?.filter(
      (cust: TCustomerForm) => cust.customer?.value === value?.value
    ).length > 1

  useEffect(() => {
    if (modalData) {
      setValue('customers', [
        {
          customer: {
            value: modalData?.id,
            label: modalData?.name,
          },
          activity:
            modalData?.activity && modalData?.activity.length > 0
              ? modalData?.activity?.map(
                  (item: { id: number; name: string }) => ({
                    value: item?.id,
                    label: item?.name,
                  })
                )
              : null,
        },
      ])
    }
    if (!open) setValue('customers', [])
  }, [modalData, open])

  const handleClose = () => {
    clearErrors()
    watch('customers')?.length > 0 && !modalData
      ? setConfirmationCloseModal(true)
      : setModal(false)
  }

  const handleSubmit = () => {
    const payload: TPayloadEntityCustomerInput = {
      is_consumption: getValues('is_consumption'),
      customers: getValues('customers').map((item: TCustomerSelected) => ({
        customer: item?.customer,
        activity: item?.activity?.map(
          (activity: OptionType) => activity?.value
        ) as number[],
      })),
    }
    onSubmit(payload)
  }

  return (
    <FormProvider {...methods}>
      <Dialog
        open={open}
        onOpenChange={handleClose}
        size="2xl"
        key={modalData?.id}
      >
        <DialogCloseButton />
        <DialogHeader>
          <h3 className="ui-text-center ui-text-[20px] ui-font-semibold">
            {modalData === null
              ? t('entity:detail.customer_vendor.customer_add', {
                  type: entityCustomerConsumptionType(t, isConsumption),
                })
              : t('entity:detail.customer_vendor.edit_activity_on_customer', {
                  type: entityCustomerConsumptionType(t, isConsumption),
                })}
          </h3>
        </DialogHeader>
        <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
        <DialogContent className="ui-overflow-auto ui-my-[8px]">
          <ModalConfirmation
            open={confirmationCloseModal}
            setOpen={setConfirmationCloseModal}
            title={t(
              'entity:detail.customer_vendor.are_you_sure_discard_customer'
            )}
            description={t(
              'entity:detail.customer_vendor.your_change_will_not_saved'
            )}
            type="delete"
            onSubmit={() => setModal(false)}
          />
          <div className="ui-flex ui-items-end ui-justify-between">
            <div className="ui-flex ui-flex-col">
              <h4 className="ui-text-[14px] ui-leading-[20px] ui-text-neutral-500">
                {t('common:form.entity.label')}:
              </h4>
              <h5 className="ui-text-[16px] ui-leading-[20px] ui-text-[#0C3045] ui-font-bold">
                {entity?.name}
              </h5>
            </div>
            {modalData === null ? (
              <div className="ui-flex ui-justify-end ui-items-center ui-w-[325px]">
                <Button
                  variant="light"
                  className="ui-mr-[16px] ui-p-0 ui-bg-transparent hover:!ui-bg-transparent"
                  onClick={() =>
                    setValue('customers', [
                      ...watch('customers'),
                      { customer: null, activity: [] },
                    ])
                  }
                  type="button"
                >
                  <div className="ui-mr-[4.16px]">
                    <Plus />
                  </div>
                  {t('entity:detail.customer_vendor.add_customer')}
                </Button>
              </div>
            ) : null}
          </div>
          {inputFields.length > 0
            ? inputFields.map((item: TCustomerSelected, idx: number) => (
                <div
                  className="ui-my-[16px] ui-flex ui-justify-center ui-items-start"
                  key={idx?.toString()}
                >
                  <FormControl className="ui-mr-[16px] ui-w-full">
                    <FormLabel className="ui-text-[14px] ui-leading-[20px]">
                      {t('entity:detail.customer_vendor.customer')}
                    </FormLabel>
                    <Controller
                      name={`customers[${idx}].customer`}
                      control={methods.control}
                      render={({ field }) => (
                        <ReactSelectAsync
                          {...field}
                          value={field.value}
                          placeholder={t(
                            'entity:detail.customer_vendor.select_customer'
                          )}
                          onChange={(value) => {
                            field.onChange(value)
                            if (checkCustomerExists(value))
                              setErrorCustomer(true)
                            else setErrorCustomer(false)
                          }}
                          disabled={modalData !== null || isProcessing}
                          loadOptions={(
                            inputValue,
                            _,
                            additional: {
                              page: number
                              id: string
                              is_consumption: number
                            }
                          ) =>
                            loadEntityCustomerOptions(
                              inputValue,
                              _,
                              additional as any
                            )
                          }
                          menuPosition="fixed"
                          additional={{
                            is_consumption: isConsumption,
                            page: 1,
                            id: id as string,
                          }}
                          error={errors?.customer?.[idx]?.customer}
                        />
                      )}
                    />
                    {errorCustomer && (
                      <FormErrorMessage>
                        {t(
                          'entity:detail.customer_vendor.customer_cannot_same'
                        )}
                      </FormErrorMessage>
                    )}
                    {errors?.customers?.[idx]?.customer && (
                      <FormErrorMessage>
                        {errors?.customers?.[idx]?.customer?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl className="ui-w-full">
                    <FormLabel>
                      {t('entity:detail.customer_vendor.activity')}
                    </FormLabel>
                    <Controller
                      name={`customers[${idx}].activity`}
                      control={methods.control}
                      render={({ field }) => (
                        <ReactSelect
                          {...field}
                          isLoading={isLoadingActivities}
                          isDisabled={isProcessing || isErrorActivities}
                          placeholder={t(
                            'entity:detail.customer_vendor.select_activity'
                          )}
                          onChange={(value) => field.onChange(value)}
                          disabled={isProcessing}
                          options={getUniqueActivityOptions(activityOptions)}
                          multiSelectCounterStyle="normal"
                          multiSelectOptionStyle="normal"
                          isMulti
                          menuPosition="fixed"
                          error={errors?.customer?.[idx]?.activity}
                        />
                      )}
                    />
                    {errors?.customers?.[idx]?.activity && (
                      <FormErrorMessage>
                        {errors?.customers?.[idx]?.activity?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  {modalData === null && (
                    <Button
                      variant="light"
                      color="danger"
                      className="ui-bg-transparent ui-p-0 ui-h-auto hover:!ui-bg-transparent ui-ml-[16px] ui-mt-[24px]"
                      onClick={() =>
                        setValue(
                          'customers',
                          watch('customers')?.filter(
                            (_: TCustomerForm, i: number) => i !== idx
                          )
                        )
                      }
                      type="button"
                    >
                      {t('common:delete')}
                      <div className="ui-ml-[4.16px] ui-rotate-45 ui-mt-1">
                        <Plus />
                      </div>
                    </Button>
                  )}
                </div>
              ))
            : null}
        </DialogContent>
        <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
        <DialogFooter>
          <div className="ui-flex ui-justify-center ui-items-end ui-w-full ui-mb-[8px]">
            <Button
              variant="outline"
              onClick={handleClose}
              className="ui-mr-[12px] ui-w-full"
              type="button"
              disabled={isProcessing}
            >
              {t('common:cancel')}
            </Button>
            <Button
              variant="solid"
              className="ui-w-full"
              type="button"
              onClick={handleSubmit}
              loading={isProcessing}
              disabled={isDisabledSubmitButton}
            >
              {t('common:save')}
            </Button>
          </div>
        </DialogFooter>
      </Dialog>
    </FormProvider>
  )
}

export default EntityDetailModalSetDistributionCustomer
