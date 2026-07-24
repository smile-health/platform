import React, { useEffect } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Plus from '#components/icons/Plus'
import { Input } from '#components/input'
import { InputNumberV2 } from '#components/input-number-v2'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { OptionType, ReactSelect } from '#components/react-select'
import { AmountOfGiving } from '#types/task'
import { Controller, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useAmountOfGiving from '../hooks/useAmountOfGiving'

type Props = {
  activity: string
  material: string
  open: boolean
  defaultAmountOfGiving: AmountOfGiving[]
  isEdit: boolean
  setModal: (value: boolean) => void
  onSave: (data: AmountOfGiving[]) => void
  consumptionUnitPerDistributionUnit: number
}

const AmountOfGivingModal: React.FC<Props> = ({
  activity,
  material,
  open,
  isEdit,
  defaultAmountOfGiving,
  setModal,
  onSave,
  consumptionUnitPerDistributionUnit,
}) => {
  const { t } = useTranslation(['common', 'task'])

  const {
    generatedFilteredOptionsTargetGroup,
    form,
    confirmationCloseModal,
    control,
    inputFields,
    errors,
    watch,
    setValue,
    setError,
    clearErrors,
    setConfirmationCloseModal,
    handleSubmit,
  } = useAmountOfGiving(open, defaultAmountOfGiving)

  const isDisabledSubmitButton = watch('amount_of_giving')?.length === 0

  useEffect(() => {
    if (!open) setValue('amount_of_giving', [])
  }, [open])

  const handleClose = () => {
    form.clearErrors()
    if (watch('amount_of_giving')?.length) {
      setConfirmationCloseModal(true)
    } else setModal(false)
  }

  const onSubmit = (data: AmountOfGiving[]) => {
    setModal(false)
    onSave(data)
  }

  return (
    <>
      <ModalConfirmation
        open={confirmationCloseModal}
        setOpen={setConfirmationCloseModal}
        title={t('task:form.amount_of_giving.confirmation.cancel.title')}
        description={t(
          'task:form.amount_of_giving.confirmation.cancel.description'
        )}
        type="delete"
        onSubmit={() => setModal(false)}
      />

      <FormProvider {...form}>
        <Dialog open={open} onOpenChange={handleClose} size="2xl">
          <DialogCloseButton />
          <DialogHeader>
            <h3 className="ui-text-center ui-text-[20px] ui-font-semibold">
              {isEdit
                ? t('task:form.amount_of_giving.edit')
                : t('task:form.amount_of_giving.add')}
            </h3>
          </DialogHeader>
          <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
          <DialogContent className="ui-overflow-visible ui-my-[8px] ui-px-0">
            <div className="ui-flex ui-items-end ui-justify-between ui-px-4">
              <div className="ui-flex ui-gap-8">
                <div className="ui-flex ui-flex-col ui-min-w-36">
                  <h4 className="ui-text-[14px] ui-leading-[20px] ui-text-neutral-500">
                    {t('common:form.activity.label')}:
                  </h4>
                  <h5 className="ui-text-[16px] ui-leading-[20px] ui-text-[#0C3045] ui-font-bold">
                    {activity}
                  </h5>
                </div>
                <div className="ui-flex ui-flex-col">
                  <h4 className="ui-text-[14px] ui-leading-[20px] ui-text-neutral-500">
                    {t('common:form.material.label')}:
                  </h4>
                  <h5 className="ui-text-[16px] ui-leading-[20px] ui-text-[#0C3045] ui-font-bold">
                    {material}
                  </h5>
                </div>
              </div>
              {!isEdit && (
                <div className="ui-flex ui-justify-end ui-items-center ui-w-[325px]">
                  <Button
                    variant="light"
                    className="ui-mr-[16px] ui-p-0 ui-bg-transparent hover:!ui-bg-transparent"
                    onClick={() =>
                      setValue('amount_of_giving', [
                        ...watch('amount_of_giving'),
                        {
                          group_target: null,
                          number_of_doses: '',
                          national_ip: '',
                          consumption_unit_per_distribution_unit: consumptionUnitPerDistributionUnit,
                        },
                      ])
                    }
                    type="button"
                  >
                    <div className="ui-mr-[4.16px]">
                      <Plus />
                    </div>
                    {t('task:form.group_target.add')}
                  </Button>
                </div>
              )}
            </div>
            {inputFields.length > 0 ? (
              inputFields.map((item, idx: number) => (
                <div
                  className="ui-my-[16px] ui-flex ui-justify-center ui-items-start ui-border-t ui-border-neutral-300 ui-pt-4 ui-px-4"
                  key={item.id}
                >
                  <FormControl className="ui-mr-[16px] ui-w-full">
                    <FormLabel>{t('task:list.columns.group_target')}</FormLabel>
                    <Controller
                      name={`amount_of_giving.${idx}.group_target`}
                      control={control}
                      render={({ field }) => (
                        <ReactSelect
                          {...field}
                          placeholder={t('task:form.group_target.placeholder')}
                          options={generatedFilteredOptionsTargetGroup(
                            field.value
                          )}
                          value={field.value}
                          onChange={(value: OptionType) => {
                            field.onChange(value)
                            setError(`amount_of_giving.${idx}.group_target`, {
                              message: undefined,
                            })
                          }}
                          error={
                            !!errors?.amount_of_giving?.[idx]?.group_target
                              ?.message
                          }
                          disabled={isEdit}
                        />
                      )}
                    />
                    {errors?.amount_of_giving?.[idx]?.group_target && (
                      <FormErrorMessage>
                        {errors?.amount_of_giving?.[idx]?.group_target?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>
                  <FormControl className="ui-mr-[16px] ui-w-full">
                    <FormLabel>
                      {t('task:list.columns.number_of_doses')}
                    </FormLabel>
                    <Controller
                      name={`amount_of_giving.${idx}.number_of_doses`}
                      control={control}
                      render={({ field }) => (
                        <InputNumberV2
                          {...field}
                          value={field.value}
                          placeholder={t(
                            'task:form.number_of_doses.placeholder'
                          )}
                          onChange={(event) => {
                            field.onChange(event.target.value)
                            setError(
                              `amount_of_giving.${idx}.number_of_doses`,
                              {
                                message: undefined,
                              }
                            )
                          }}
                          error={
                            !!errors?.amount_of_giving?.[idx]?.number_of_doses
                              ?.message
                          }
                        />
                      )}
                    />
                    {errors?.amount_of_giving?.[idx]?.number_of_doses && (
                      <FormErrorMessage>
                        {
                          errors?.amount_of_giving?.[idx]?.number_of_doses
                            ?.message
                        }
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl className="ui-min-w-52">
                    <FormLabel htmlFor="national_ip">
                      {t('task:form.national_ip.label')}
                    </FormLabel>
                    <Controller
                      name={`amount_of_giving.${idx}.national_ip`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="national_ip"
                          placeholder={t('task:form.national_ip.placeholder')}
                          error={
                            !!errors?.amount_of_giving?.[idx]?.national_ip
                              ?.message
                          }
                        />
                      )}
                    />
                    {errors?.amount_of_giving?.[idx]?.national_ip && (
                      <FormErrorMessage>
                        {errors?.amount_of_giving?.[idx]?.national_ip?.message}
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  {!isEdit && (
                    <Button
                      variant="light"
                      color="danger"
                      className="ui-bg-transparent ui-p-0 ui-h-auto hover:!ui-bg-transparent ui-ml-4 ui-mt-[28px]"
                      onClick={() => {
                        setValue(
                          'amount_of_giving',
                          form
                            .watch('amount_of_giving')
                            ?.filter((_, i: number) => i !== idx)
                        )
                        clearErrors(`amount_of_giving.${idx}`)
                      }}
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
            ) : (
              <div className="ui-border ui-border-neutral-300 ui-mt-4">
                <EmptyState
                  withIcon
                  title={t('common:message.empty.title')}
                  description={t('common:message.empty.description')}
                  className="ui-mt-8 ui-pb-16"
                />
              </div>
            )}
          </DialogContent>
          <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
          <DialogFooter>
            <div className="ui-flex ui-justify-center ui-items-end ui-w-full ui-mb-[8px]">
              <Button
                variant="outline"
                onClick={handleClose}
                className="ui-mr-[12px] ui-w-full"
                type="button"
              >
                {t('common:cancel')}
              </Button>
              <Button
                variant="solid"
                className="ui-w-full"
                type="button"
                onClick={() => handleSubmit(onSubmit)}
                disabled={isDisabledSubmitButton}
              >
                {t('common:save')}
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      </FormProvider>
    </>
  )
}

export default AmountOfGivingModal
