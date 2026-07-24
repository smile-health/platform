import React, { useCallback, useMemo } from 'react'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import {
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalRoot,
} from '#components/modal'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import cx from '#lib/cx'
import { Controller, ControllerRenderProps, FieldValues } from 'react-hook-form'

import { TAssetInventory } from '../../asset-inventory/list/libs/asset-inventory-list.types'
import {
  TCreateLoggerSubmit,
  TCreateWarehouseSubmit,
  TRelationData,
} from '../asset-managements.types'
import { useLoggerRelationCreateEdit } from '../hooks/useLoggerRelationCreateEdit'
import { MonitoringDeviceInventoryDetail } from '../monitoring-device-inventory/MonitoringDeviceInventoryDetail/monitoring-device-inventory.type'
import { loadMonitoringDeviceInventory } from '../monitoring-device-inventory/MonitoringDeviceInventoryList/monitoring-device-inventory-list.service'

const DescriptionTextArea: React.FC<{
  field: ControllerRenderProps<FieldValues, keyof TCreateWarehouseSubmit>
  trigger: (name: keyof TCreateWarehouseSubmit) => void
  placeholder: string
}> = ({ field, trigger, placeholder }) => {
  return (
    <Input
      id={'description'}
      placeholder={placeholder}
      {...field}
      onChange={(e) => {
        field.onChange(e.target.value)
        trigger('description')
      }}
    />
  )
}

const MonitoringDeviceSelect: React.FC<{
  field: ControllerRenderProps<FieldValues, keyof TCreateLoggerSubmit>
  trigger: (name: keyof TCreateLoggerSubmit) => void
  placeholder: string
  detailData?: TAssetInventory | MonitoringDeviceInventoryDetail
  loggerData?: TRelationData[]
}> = ({ field, trigger, placeholder, detailData, loggerData }) => {
  return (
    <ReactSelectAsync
      {...field}
      id={'monitoring_device_name'}
      loadOptions={loadMonitoringDeviceInventory}
      debounceTimeout={300}
      placeholder={placeholder}
      onChange={(option: OptionType) => {
        field.onChange(option)
        trigger('monitoring_device')
      }}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      additional={{
        page: 1,
        paginate: 10,
        is_device_related: 0,
        health_center_id: detailData?.entity?.id?.toString(),
        logger_ids: loggerData?.map((item) => item.id),
      }}
    />
  )
}

const SensorQuantitySelect: React.FC<{
  field: ControllerRenderProps<FieldValues, keyof TCreateLoggerSubmit>
  trigger: (name: keyof TCreateLoggerSubmit) => void
  placeholder: string
}> = ({ field, trigger, placeholder }) => {
  const loadSensorOptions = () => {
    const options = Array.from({ length: 10 }, (_, i) => ({
      label: (i + 1).toString(),
      value: i + 1,
    }))
    return {
      options,
      hasMore: false,
      page: 1,
      paginate: 10,
    }
  }

  return (
    <ReactSelectAsync
      {...field}
      id={'sensor'}
      loadOptions={loadSensorOptions}
      debounceTimeout={300}
      placeholder={placeholder}
      menuPortalTarget={document.body}
      onChange={(option: OptionType) => {
        field.onChange(option)
        trigger('sensor_qty')
      }}
    />
  )
}

type AssetManagementsAddDeviceRelationProps = {
  open: boolean
  onClose: () => void
  detailData?: TAssetInventory | MonitoringDeviceInventoryDetail
  loggerData?: TRelationData[]
  onHandleSuccess: () => void
  isWarehouse?: boolean
}

const AssetManagementsAddDeviceRelation = ({
  open,
  onClose,
  detailData,
  loggerData,
  onHandleSuccess,
  isWarehouse,
}: AssetManagementsAddDeviceRelationProps) => {
  const handleSuccess = useCallback(() => {
    onHandleSuccess()
    onClose()
  }, [onHandleSuccess, onClose])

  const { t, methods, handleSubmit, isLoading } = useLoggerRelationCreateEdit({
    onHandleSuccess: handleSuccess,
    isDelete: false,
    detailData,
    loggerData,
    isWarehouse,
  })
  const modalRoot = document.body

  const {
    control,
    trigger,
    clearErrors,
    formState: { errors },
  } = methods

  const fields = useMemo(
    () => [
      {
        name: 'monitoring_device',
        label: t(
          'assetInventory:device_relation.form.monitoring_device_name.label'
        ),
        required: true,
        placeholder: t(
          'assetInventory:device_relation.form.monitoring_device_name.placeholder'
        ),
        component: MonitoringDeviceSelect,
      },
      ...(isWarehouse
        ? [
            {
              name: 'description',
              label: t('assetInventory:device_relation.form.description.label'),
              placeholder: t(
                'assetInventory:device_relation.form.description.placeholder'
              ),
              required: false,
              component: DescriptionTextArea,
            },
          ]
        : [
            {
              name: 'sensor_qty',
              label: t('assetInventory:device_relation.form.sensor.label'),
              placeholder: t(
                'assetInventory:device_relation.form.sensor.placeholder'
              ),
              required: true,
              component: SensorQuantitySelect,
            },
          ]),
    ],
    [t, detailData, loggerData, trigger, isWarehouse]
  )

  return (
    <ModalRoot
      size="lg"
      open={open}
      setOpen={onClose}
      className="ui-z-10"
      classNameOverlay="ui-z-10"
      closeOnOverlayClick={false}
      portalContainer={modalRoot}
      scrollBehavior="outside"
    >
      <form onSubmit={handleSubmit} noValidate {...methods}>
        <ModalHeader
          className={cx('ui-space-2 relative')}
          containerClassName={cx('ui-p-6 ui-pb-0 ui-mb-4')}
        >
          <div className="ui-text-xl ui-font-semibold ui-text-dark-blue">
            {t('assetInventory:device_relation.title.form')}
          </div>
          <ModalCloseButton className="ui-top-0 ui-right-0" />
        </ModalHeader>
        <hr />

        <ModalContent className="ui-space-y-6 ui-px-6 ui-pt-4 ui-pb-8">
          {fields.map((formField) => {
            return (
              <Controller
                key={formField.name}
                name={
                  formField.name as
                    | keyof TCreateLoggerSubmit
                    | keyof TCreateWarehouseSubmit
                }
                control={control}
                render={({ field }) => {
                  const fieldId = `select-material-${field?.value}`
                  const FieldComponent = formField.component as React.FC<any>
                  return (
                    <FormControl>
                      <FormLabel
                        htmlFor={fieldId}
                        required={formField.required}
                      >
                        {formField.label}
                      </FormLabel>
                      <FieldComponent
                        field={
                          field as unknown as ControllerRenderProps<
                            FieldValues,
                            | keyof TCreateLoggerSubmit
                            | keyof TCreateWarehouseSubmit
                          >
                        }
                        trigger={trigger}
                        placeholder={formField.placeholder}
                        {...(formField.name === 'monitoring_device'
                          ? { detailData, loggerData }
                          : {})}
                      />
                      {errors?.[formField.name as keyof typeof errors] && (
                        <FormErrorMessage>
                          {(errors as any)?.[formField.name]?.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  )
                }}
              />
            )
          })}
        </ModalContent>

        <ModalFooter
          className={cx(
            'ui-flex ui-p-6 ui-justify-between ui-items-center ui-gap-4'
          )}
        >
          <div className="ui-flex ui-justify-end ui-gap-2 ui-w-full">
            <Button
              type="button"
              id="btnCancelItemModalForm"
              variant="outline"
              onClick={() => {
                clearErrors()
                onClose()
                methods.reset()
              }}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              id="btnSaveItemModalForm"
              disabled={isLoading}
              loading={isLoading}
            >
              {t('assetInventory:device_relation.button.save_relation')}
            </Button>
          </div>
        </ModalFooter>
      </form>
    </ModalRoot>
  )
}

export default AssetManagementsAddDeviceRelation
