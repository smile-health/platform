import { useEffect } from 'react'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
} from '#components/modal'
import { ReactSelectAsync } from '#components/react-select'
import { loadStatusAsset } from '#services/status-asset'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { UpdateStorageTemperatureMonitoringStatusRequest } from '../../storage-temperature-monitoring-detail.service'
import { DetailUpdateBody } from './DetailUpdateStatusButton'

type DetailUpdateStatusModalProps = {
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: (data: UpdateStorageTemperatureMonitoringStatusRequest) => void
  isUpdating: boolean
  defaultValues: DetailUpdateBody
}

export const DetailUpdateStatusModal = ({
  open,
  setOpen,
  onConfirm,
  isUpdating,
  defaultValues,
}: DetailUpdateStatusModalProps) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'storageTemperatureMonitoringDetail'])

  const methods = useForm<DetailUpdateBody>({
    defaultValues,
    mode: 'onChange',
  })

  const onValid: SubmitHandler<DetailUpdateBody> = (formData) => {
    const payload: UpdateStorageTemperatureMonitoringStatusRequest = {
      working_status_id: Number(formData.working_status?.value),
    }
    onConfirm(payload)
    setOpen(false)
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = methods

  useEffect(() => {
    methods.reset(defaultValues)
  }, [defaultValues, methods])

  return (
    <ModalRoot
      open={open}
      closeOnOverlayClick={false}
      className="ui-z-10"
      classNameOverlay="ui-z-10"
      size="md"
      scrollBehavior="outside"
    >
      <form onSubmit={handleSubmit(onValid)} {...methods}>
        <ModalCloseButton onClick={() => setOpen(false)} />
        <ModalHeader className="ui-text-center ui-text-xl">
          {t('storageTemperatureMonitoringDetail:modal.change_status.title')}
        </ModalHeader>
        <ModalContent className="ui-space-y-4">
          <FormControl className="ui-w-full">
            <FormLabel htmlFor="working_status">
              {t(
                'storageTemperatureMonitoringDetail:modal.change_status.fields.operational_status.label'
              )}
            </FormLabel>
            <Controller
              name="working_status"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <ReactSelectAsync
                  {...field}
                  key={`working_status__${field.value?.value}_${language}`}
                  id="working_status"
                  isClearable
                  loadOptions={loadStatusAsset}
                  placeholder={t(
                    'storageTemperatureMonitoringDetail:modal.change_status.fields.operational_status.placeholder'
                  )}
                  additional={{
                    page: 1,
                  }}
                  error={!!error?.message}
                  menuPortalTarget={document.body}
                />
              )}
            />
            {errors?.working_status?.message && (
              <FormErrorMessage>
                {errors?.working_status?.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </ModalContent>
        <ModalFooter className="ui-justify-center">
          <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full ui-mx-auto">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isUpdating}
            >
              {t(
                'storageTemperatureMonitoringDetail:modal.change_status.button.cancel'
              )}
            </Button>
            <Button
              color="primary"
              type="submit"
              loading={isUpdating}
              disabled={isUpdating}
            >
              {t(
                'storageTemperatureMonitoringDetail:modal.change_status.button.save'
              )}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </ModalRoot>
  )
}
