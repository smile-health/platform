import { Fragment, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { ReactSelectAsync } from '#components/react-select'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import cx from '#lib/cx'
import {
  v2AddMaterialEntity,
  v2DeleteMaterialEntity,
  v2UpdateMaterialEntity,
} from '#services/entity'
import { loadMaterial } from '#services/material'
import { ErrorResponse } from '#types/common'
import {
  TEntityMasterMaterial,
  TMaterialEntity,
  TUpdateMaterialEntity,
} from '#types/entity'
import { TProgram } from '#types/program'
import { numberFormatter } from '#utils/formatter'
import { AxiosError } from 'axios'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { MATERIAL_LEVEL } from '../../material/utils/material.constants'
import { updateMaterialEntitySchema } from '../schema/EntitySchemaForm'
import EntityDetailMaterialManagementContext from '../utils/entity-detail-material-management-context'
import EntityDetailLabel from './EntityDetailLabel'
import EntityDetailMaterialManagementEditForm from './Form/EntityDetailMaterialManagementEditForm'

type Props = {
  open: boolean
  setModal: (value: boolean) => void
  modalData?: TMaterialEntity
  title: string
  createMode?: boolean
  programData?: TProgram
}

const EntityDetailModalMaterialOnActivities: React.FC<Props> = ({
  open,
  setModal,
  modalData = null,
  title,
  createMode = false,
  programData,
}) => {
  const router = useRouter()
  const { id } = router.query
  const useClient = useQueryClient()
  const {
    t,
    i18n: { language },
  } = useTranslation(['entity', 'common', 'material'])
  const { entity, params, keyword } = useContext(
    EntityDetailMaterialManagementContext
  )

  const [confirmationDeleteModal, setConfirmationDeleteModal] =
    useState<boolean>(false)
  const [deleteData, setDeleteData] = useState<TEntityMasterMaterial | null>(
    null
  )

  const [editData, setEditData] = useState<TEntityMasterMaterial | null>(null)
  const [activityOptions, setActivityOptions] = useState<
    | Array<{
        id: number
        name: string
        material_id: number
        is_ordered_purchase: number
        is_ordered_sales: number
      }>
    | []
  >([])
  const methods = useForm<TUpdateMaterialEntity>({
    mode: 'onChange',
    resolver: yupResolver(updateMaterialEntitySchema(t)),
    defaultValues: {
      entity_master_material_activities_id: null,
      activity_id: null,
      entity_id: null,
      min: null,
      max: null,
      consumption_rate: null,
      retailer_price: null,
      tax: null,
      material_id: modalData?.material_id ?? null,
      entity_material_id: null,
    },
  })

  const { reset, handleSubmit, setValue, setError } = methods

  useEffect(() => {
    reset({
      entity_master_material_activities_id:
        editData?.entity_master_material_activities_id,
      activity_id: editData?.activity
        ? { value: editData?.activity?.id, label: editData?.activity?.name }
        : null,
      entity_id: editData?.entity_master_material?.entity_id,
      min: editData?.min === null ? undefined : Number(editData?.min),
      max: editData?.max === null ? undefined : Number(editData?.max),
      consumption_rate:
        editData?.consumption_rate === null
          ? undefined
          : Number(editData?.consumption_rate),
      retailer_price:
        editData?.retailer_price === null
          ? undefined
          : Number(editData?.retailer_price),
      tax: editData?.tax === null ? undefined : Number(editData?.tax),
      material_id: editData?.material_id,
      entity_material_id: editData?.entity_master_material?.id,
    })
  }, [editData, methods])

  const handleClose = () => {
    reset()
    setEditData(null)
    setActivityOptions([])
    setValue('material_id', null)
    setModal(false)
  }

  const {
    mutate: onAddOrUpdateEntityMaterial,
    isPending: onLoadingUpdateMaterialEntity,
  } = useMutation({
    mutationFn: (data: TUpdateMaterialEntity) =>
      createMode
        ? v2AddMaterialEntity(id as string, data)
        : v2UpdateMaterialEntity(id as string, data),
    onSuccess: async () => {
      await useClient.invalidateQueries({
        queryKey: ['material__entity', { ...params, keyword, id }],
      })
      setEditData(null)
      if (createMode) {
        toast.success({
          description: t('entity:form.success.success_add_material_entity'),
        })
        handleClose()
      } else {
        toast.success({
          description: t('entity:form.success.success_update_material_entity'),
        })
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response =
          (error.response?.data as ErrorResponse) || error?.message
        toast.danger({ description: response.message })
        if (response.errors) {
          for (const item of Object.keys(response.errors)) {
            setError(item as keyof TUpdateMaterialEntity, {
              message: response.errors[item][0],
            })
          }
        }
      }
    },
  })

  const formMaterialSubmit: SubmitHandler<TUpdateMaterialEntity> = (data) => {
    onAddOrUpdateEntityMaterial(data)
  }

  const {
    mutate: onDeleteEntityMaterial,
    isPending: onLoadingDeleteEntityMaterial,
  } = useMutation({
    mutationFn: ({
      id,
      entityMasterMaterialActivitiesId,
    }: {
      id: number | string
      entityMasterMaterialActivitiesId: number
    }) =>
      v2DeleteMaterialEntity(id as string, entityMasterMaterialActivitiesId),
    onSuccess: async () => {
      await useClient.invalidateQueries({
        queryKey: ['material__entity', { ...params, keyword, id }],
      })
      setDeleteData(null)
      setActivityOptions([])
      toast.success({
        description: t('entity:form.success.success_delete_material_entity'),
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

  const handleOpenDeleteConfirmation = (data: TEntityMasterMaterial) => {
    setDeleteData(data)
    setConfirmationDeleteModal(true)
  }

  useSetLoadingPopupStore(
    onLoadingUpdateMaterialEntity || onLoadingDeleteEntityMaterial
  )

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={handleClose}
        size="2xl"
        key={`${modalData?.material_id}__${Number(createMode)}`}
        closeOnOverlayClick={false}
      >
        <ModalConfirmation
          key={`${deleteData?.material_id as number}__${deleteData?.entity_master_material_activities_id}__${deleteData?.activity?.id}`}
          open={confirmationDeleteModal}
          setOpen={setConfirmationDeleteModal}
          title={t('common:confirmation')}
          description={t('entity:detail.material_entity.delete_confirmation')}
          subDescription={t(
            'entity:detail.material_entity.delete_material_activity_warning',
            {
              materialName: modalData?.name ?? '',
              activityName: deleteData?.activity?.name ?? '',
            }
          )}
          type="delete"
          buttonTitle={t('common:delete')}
          onSubmit={() =>
            onDeleteEntityMaterial({
              id: id as string,
              entityMasterMaterialActivitiesId:
                deleteData?.entity_master_material_activities_id as number,
            })
          }
        />
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(formMaterialSubmit)}>
            <DialogCloseButton />
            <DialogHeader className="ui-my-[8px]">
              <h3 className="ui-text-center ui-text-[20px] ui-font-semibold">
                {title}
              </h3>
            </DialogHeader>
            <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
            <DialogContent className="ui-overflow-auto ui-my-[8px]">
              <div
                className={cx('ui-flex ui-items-start', {
                  'ui-justify-between': createMode,
                  'ui-justify-start': !createMode,
                })}
              >
                {!createMode ? (
                  <div className="ui-mr-[24px]">
                    <EntityDetailLabel
                      title={t('material:title.material')}
                      subTitle={modalData?.name}
                    />
                  </div>
                ) : null}
                <EntityDetailLabel
                  title={t('common:form.entity.label')}
                  subTitle={entity?.name}
                />
                {createMode && programData ? (
                  <Controller
                    name="material_id"
                    control={methods.control}
                    render={({
                      field: { onChange, ...field },
                      fieldState: { error },
                    }) => {
                      return (
                        <FormControl className="ui-w-[325px]">
                          <FormLabel>
                            {t('material:form.material_name.label')}
                          </FormLabel>
                          <ReactSelectAsync
                            {...field}
                            id="select__material"
                            loadOptions={(keyword, _, additional) =>
                              loadMaterial(keyword, _, additional) as any
                            }
                            onChange={(value) => {
                              setActivityOptions(
                                (value as any)?.material_activities || []
                              )
                              onChange(value)
                              setValue('activity_id', null)
                            }}
                            placeholder={t(
                              'entity:detail.material_entity.select_material'
                            )}
                            additional={{
                              page: 1,
                              is_with_activities: true,
                              material_level_id: programData?.config?.material
                                ?.is_hierarchy_enabled
                                ? MATERIAL_LEVEL.ACTIVE_SUBSTANCE.toString()
                                : null,
                              program_id: programData?.id,
                            }}
                            menuPosition="fixed"
                          />
                          {error?.message ? (
                            <FormErrorMessage>{error.message}</FormErrorMessage>
                          ) : null}
                        </FormControl>
                      )
                    }}
                  />
                ) : null}
              </div>
              <div className="ui-py-[16px]">
                <div className="ui-border ui-border-neutral-300 ui-rounded-md ui-overflow-auto">
                  <Table
                    hightlightOnHover
                    overflowXAuto
                    stickyOffset={0}
                    empty={
                      (!modalData?.entity_master_materials ||
                        modalData?.entity_master_materials?.length === 0) &&
                      !createMode
                    }
                  >
                    <Thead>
                      <Tr>
                        <Th
                          columnKey="activity_name"
                          className="ui-font-semibold ui-w-[300px]"
                        >
                          {t('entity:detail.customer_vendor.activity')}
                        </Th>
                        <Th columnKey="min" className="ui-font-semibold">
                          {t('entity:detail.material_entity.min')}
                        </Th>
                        <Th columnKey="max" className="ui-font-semibold">
                          {t('entity:detail.material_entity.max')}
                        </Th>
                        <Th
                          columnKey="consumption_rate"
                          className="ui-font-semibold"
                        >
                          {t('entity:detail.material_entity.consumption_rate')}
                        </Th>
                        <Th
                          columnKey="retailer_price"
                          className="ui-font-semibold"
                        >
                          {t('entity:detail.material_entity.retailer_price')}
                        </Th>
                        <Th columnKey="tax" className="ui-font-semibold">
                          {t('entity:detail.material_entity.tax')}
                        </Th>
                        {!createMode ? (
                          <Th
                            columnKey="action"
                            className="ui-font-semibold ui-w-auto"
                          >
                            {t('common:action')}
                          </Th>
                        ) : null}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {createMode ? (
                        <EntityDetailMaterialManagementEditForm
                          setEditData={setEditData}
                          isLoading={onLoadingUpdateMaterialEntity}
                          createMode={createMode}
                          activityOptions={activityOptions}
                        />
                      ) : null}
                      {modalData?.entity_master_materials?.map((item, idx) => (
                        <Fragment key={idx?.toString()}>
                          {editData &&
                          editData?.activity?.id === item?.activity?.id ? (
                            <EntityDetailMaterialManagementEditForm
                              setEditData={setEditData}
                              isLoading={onLoadingUpdateMaterialEntity}
                            />
                          ) : (
                            <Tr>
                              <Td>{item?.activity?.name || '-'}</Td>
                              <Td>
                                {item?.min === null
                                  ? '-'
                                  : numberFormatter(item?.min, language)}
                              </Td>
                              <Td>
                                {item?.max === null
                                  ? '-'
                                  : numberFormatter(item?.max, language)}
                              </Td>
                              <Td>
                                {item?.consumption_rate === null
                                  ? '-'
                                  : numberFormatter(
                                      item?.consumption_rate,
                                      language
                                    )}
                              </Td>
                              <Td>
                                {item?.retailer_price === null
                                  ? '-'
                                  : numberFormatter(
                                      item?.retailer_price,
                                      language
                                    )}
                              </Td>
                              <Td>
                                {item?.tax === null
                                  ? '-'
                                  : numberFormatter(item?.tax, language)}
                              </Td>
                              <Td>
                                <div className="ui-flex ui-justify-start ui-items-center">
                                  <Button
                                    id={`edit_${item?.activity?.id}`}
                                    variant="light"
                                    className="ui-bg-transparent ui-p-0 ui-h-auto ui-mr-[18px] ui-text-[#0069D2] hover:!ui-bg-transparent"
                                    type="button"
                                    disabled={entity?.status === BOOLEAN.FALSE}
                                    onClick={() => setEditData(item)}
                                    loading={onLoadingUpdateMaterialEntity}
                                  >
                                    {t(
                                      'entity:detail.material_entity.edit_relation'
                                    )}
                                  </Button>
                                  <Button
                                    id={`delete_${item?.activity?.id}`}
                                    variant="light"
                                    color="danger"
                                    className="ui-bg-transparent ui-p-0 ui-h-auto hover:!ui-bg-transparent"
                                    type="button"
                                    disabled={entity?.status === BOOLEAN.FALSE}
                                    loading={
                                      onLoadingDeleteEntityMaterial &&
                                      deleteData?.activity?.id ===
                                        item?.activity?.id
                                    }
                                    onClick={() =>
                                      handleOpenDeleteConfirmation(item)
                                    }
                                  >
                                    {t('common:delete')}
                                  </Button>
                                </div>
                              </Td>
                            </Tr>
                          )}
                        </Fragment>
                      ))}
                    </Tbody>
                    <TableEmpty>
                      <EmptyState
                        title={t('common:message.empty.title')}
                        description={t('common:message.empty.description')}
                        withIcon
                      />
                    </TableEmpty>
                  </Table>
                </div>
              </div>
            </DialogContent>

            {createMode ? (
              <>
                <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
                <DialogFooter>
                  <div className="ui-flex ui-justify-end ui-mb-[8px]">
                    <Button
                      id="cancel_add_material_entity"
                      variant="light"
                      type="button"
                      onClick={handleClose}
                      className="ui-mr-[12px]"
                      disabled={onLoadingUpdateMaterialEntity}
                    >
                      {t('common:cancel')}
                    </Button>
                    <Button
                      id="add_material_entity"
                      color="primary"
                      type="submit"
                      loading={onLoadingUpdateMaterialEntity}
                    >
                      {t('entity:detail.material_entity.add_relation')}
                    </Button>
                  </div>
                </DialogFooter>
              </>
            ) : null}
          </form>
        </FormProvider>
      </Dialog>
      <style>{`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
           -moz-appearance: textfield;
        }
      `}</style>
    </>
  )
}

export default EntityDetailModalMaterialOnActivities
