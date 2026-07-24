import React, { useEffect } from 'react'
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
import { ReactSelectAsync } from '#components/react-select'
import { Controller, FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useRelationActivityMaterial from '../hooks/useRelationActivityMaterial'
import { loadActivities, loadMaterials } from '../protocol.service'
import { RelationActivityMaterial } from '../protocol.type'

type TSingleOption = { value: string | number; label: string | number } | null
type TRelationSelected = {
  activity: TSingleOption | null
  material: TSingleOption | null
}

type Props = {
  protocolName: string
  open: boolean
  setModal: (value: boolean) => void
}

const MaterialActivityRelationModal: React.FC<Props> = ({
  protocolName,
  open,
  setModal,
}) => {
  const { t } = useTranslation(['common', 'protocol'])
  const {
    form,
    confirmationCloseModal,
    control,
    inputFields,
    errors,
    watch,
    setValue,
    setError,
    setConfirmationCloseModal,
    handleSubmit,
  } = useRelationActivityMaterial()

  const isDisabledSubmitButton = watch('relations')?.length === 0

  useEffect(() => {
    if (!open) setValue('relations', [])
  }, [open])

  const handleClose = () => {
    form.clearErrors()
    if (watch('relations')?.length) {
      setConfirmationCloseModal(true)
    } else setModal(false)
  }

  const onSubmit = () => {
    setModal(false)
  }

  return (
    <>
      <ModalConfirmation
        open={confirmationCloseModal}
        setOpen={setConfirmationCloseModal}
        title={t(
          'protocol:detail.material_activity.relation.confirmation.cancel.title'
        )}
        description={t(
          'protocol:detail.material_activity.relation.confirmation.cancel.description'
        )}
        type="delete"
        onSubmit={() => setModal(false)}
      />

      <FormProvider {...form}>
        <Dialog open={open} onOpenChange={handleClose} size="2xl">
          <DialogCloseButton />
          <DialogHeader>
            <h3 className="ui-text-center ui-text-[20px] ui-font-semibold">
              {t('protocol:detail.material_activity.relation.add.button')}
            </h3>
          </DialogHeader>
          <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
          <DialogContent className="ui-overflow-auto ui-my-[8px]">
            <div className="ui-flex ui-items-end ui-justify-between">
              <div className="ui-flex ui-flex-col">
                <h4 className="ui-text-[14px] ui-leading-[20px] ui-text-neutral-500">
                  {t('protocol:column.name')}:
                </h4>
                <h5 className="ui-text-[16px] ui-leading-[20px] ui-text-[#0C3045] ui-font-bold">
                  {protocolName}
                </h5>
              </div>
              <div className="ui-flex ui-justify-end ui-items-center ui-w-[325px]">
                <Button
                  variant="light"
                  className="ui-mr-[16px] ui-p-0 ui-bg-transparent hover:!ui-bg-transparent"
                  onClick={() =>
                    setValue('relations', [
                      ...watch('relations'),
                      {
                        activity: null,
                        material: null,
                      },
                    ])
                  }
                  type="button"
                >
                  <div className="ui-mr-[4.16px]">
                    <Plus />
                  </div>
                  {t('protocol:detail.material_activity.relation.add.button')}
                </Button>
              </div>
            </div>
            {inputFields.length > 0
              ? inputFields.map((item: TRelationSelected, idx: number) => (
                  <div
                    className="ui-my-[16px] ui-flex ui-justify-center ui-items-start"
                    key={idx?.toString()}
                  >
                    <FormControl className="ui-mr-[16px] ui-w-full">
                      <FormLabel>
                        {t(
                          'protocol:detail.material_activity.relation.activity.label'
                        )}
                      </FormLabel>
                      <Controller
                        name={`relations.${idx}.activity`}
                        control={control}
                        render={({ field }) => (
                          <ReactSelectAsync
                            {...field}
                            value={field.value}
                            placeholder={t(
                              'protocol:detail.material_activity.relation.activity.placeholder'
                            )}
                            onChange={(value) => {
                              field.onChange(value)
                              setValue(`relations.${idx}.material`, null)
                              setError(`relations.${idx}.activity`, {
                                message: undefined,
                              })
                            }}
                            loadOptions={(
                              inputValue,
                              _,
                              additional: {
                                page: number
                                paginate: number
                              }
                            ) =>
                              loadActivities(inputValue, _, additional as any)
                            }
                            menuPosition="fixed"
                            additional={{
                              page: 1,
                              paginate: 10,
                            }}
                            error={
                              !!errors?.relations?.[idx]?.activity?.message
                            }
                          />
                        )}
                      />
                      {errors?.relations?.[idx]?.activity && (
                        <FormErrorMessage>
                          {errors?.relations?.[idx]?.activity?.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                    <FormControl className="ui-w-full">
                      <FormLabel>
                        {t(
                          'protocol:detail.material_activity.relation.material.label'
                        )}
                      </FormLabel>
                      <Controller
                        name={`relations.${idx}.material`}
                        control={control}
                        render={({ field }) => (
                          <ReactSelectAsync
                            {...field}
                            value={field.value}
                            placeholder={t(
                              'protocol:detail.material_activity.relation.material.placeholder'
                            )}
                            onChange={(value) => {
                              field.onChange(value)
                              setError(`relations.${idx}.material`, {
                                message: undefined,
                              })
                            }}
                            disabled={!watch('relations')?.[idx]?.activity}
                            loadOptions={(
                              inputValue,
                              _,
                              additional: {
                                page: number
                                paginate: number
                                activity_id: string
                              }
                            ) =>
                              loadMaterials(inputValue, _, additional as any)
                            }
                            menuPosition="fixed"
                            additional={{
                              page: 1,
                              paginate: 10,
                              activity_id:
                                watch('relations')?.[idx]?.activity?.value,
                            }}
                            error={
                              !!errors?.relations?.[idx]?.material?.message
                            }
                          />
                        )}
                      />
                      {errors?.relations?.[idx]?.material && (
                        <FormErrorMessage>
                          {errors?.relations?.[idx]?.material?.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>

                    <Button
                      variant="light"
                      color="danger"
                      className="ui-bg-transparent ui-p-0 ui-h-auto hover:!ui-bg-transparent ui-ml-4 ui-mt-[28px]"
                      onClick={() =>
                        setValue(
                          'relations',
                          form
                            .watch('relations')
                            ?.filter(
                              (_: RelationActivityMaterial, i: number) =>
                                i !== idx
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

export default MaterialActivityRelationModal
