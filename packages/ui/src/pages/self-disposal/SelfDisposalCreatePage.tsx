import React, { useState } from 'react'
import { PlusIcon } from '@heroicons/react/24/solid'
import { yupResolver } from '@hookform/resolvers/yup'
import { toast } from '@repo/ui/components/toast'
import { useMutation } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { InputNumberV2 } from '#components/input-number-v2'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { parseDateTime } from '#utils/date'
import { getUserStorage } from '#utils/storage/user'
import { generateMetaTitle } from '#utils/strings'
import { AxiosError } from 'axios'
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import SelfDisposalCreateConfirmation from './components/SelfDisposalCreateConfirmation'
import SelfDisposalCreateDetailDisposal from './components/SelfDisposalCreateDetailDisposal'
import SelfDisposalCreateListStock from './components/SelfDisposalCreateListStock'
import SelfDisposalCreateWarning from './components/SelfDisposalCreateWarning'
import {
  FormData,
  FormDataDetail,
  schema,
  schemaDetail,
} from './schema/SelfDisposalFormSchema'
import {
  createSelfDisposal,
  CreateSelfDisposalPayload,
} from './self-disposal.service'
import { useProgram } from '#hooks/program/useProgram'
import SelfDisposalCreateModalReset from './components/SelfDisposalCreateModalReset'
import { useModalResetStore } from './self-disposal.store'
import { numberFormatter } from '#utils/formatter'
import SelfDisposalModalConfirmationChange from './components/SelfDisposalModalConfirmationChange'
import { ValueChange } from './self-disposal.type'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'

const SelfDisposalCreatePage = () => {
  const { t, i18n: { language } } = useTranslation(['common', 'selfDisposal'])

  const router = useSmileRouter()

  const isSuperAdmin = hasPermission('self-disposal-enable-select-entity')
  const userStorage = getUserStorage()
  const { activeProgram } = useProgram()
  const { setModalReset } = useModalResetStore()

  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      entity: isSuperAdmin
        ? null
        : { label: userStorage?.entity?.name, value: activeProgram?.entity_id },
      activity: null,
      disposal_method: null,
      no_document: '',
      comment: '',
      materials: [],
    } as any,
  })

  const { mutate, isPending } = useMutation({
    mutationKey: ['self-disposal-create'],
    mutationFn: (data: CreateSelfDisposalPayload) => createSelfDisposal(data),
    onSuccess: () => {
      toast.success({
        description: t('selfDisposal:toast.create_success'),
      })
      router.push('/v5/self-disposal')
    },
    onError: (error: AxiosError) => {
      const { message } = error.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const items = []
    if (!data.materials || data.materials.length === 0) {
      return
    }

    let materialIndex = 0
    let hasIncompleteMaterial = false
    for (const material of data.materials) {
      const validMaterialItems = []
      for (const item of material.items) {
        for (const disposal of item.disposals) {
          const disposal_discard_qty = disposal?.disposal_discard_qty || 0
          const disposal_received_qty = disposal?.disposal_received_qty || 0

          if (disposal_discard_qty > 0 || disposal_received_qty > 0) {
            validMaterialItems.push({
              disposal_stock_id: disposal.id,
              transaction_reason_id: disposal.transaction_reason.id,
              disposal_discard_qty: disposal_discard_qty,
              disposal_received_qty: disposal_received_qty,
            })
          }
        }
      }

      if (validMaterialItems.length === 0) {
        methods.setError(`materials.${materialIndex}`, {
          type: 'manual',
          message: `Required`,
        })
        hasIncompleteMaterial = true
      }

      materialIndex = materialIndex + 1
      items.push(...validMaterialItems)
    }

    if (hasIncompleteMaterial) {
      return
    }

    if (!isOpenConfirmation) {
      methods.setValue('no_document', '')
      methods.setValue('comment', '')
      setIsOpenConfirmation(true)
      return
    }

    if (isOpenConfirmation) {
      if (data.no_document === '') {
        methods.setError('no_document', {
          type: 'manual',
          message: t('common:validation.required'),
        })
        return
      }
    }

    mutate({
      disposal_method_id: data.disposal_method?.value,
      activity_id: data.activity?.value,
      entity_id: data.entity?.value,
      report_number: data.no_document ?? '',
      comment: data.comment ?? '',
      //@ts-ignore
      disposal_items: items,
    })
  }

  useSetLoadingPopupStore(isPending)

  const {
    watch,
    control,
    formState: { errors },
  } = methods

  const { remove, update } = useFieldArray({
    control,
    name: 'materials',
  })

  const [currentMaterialIndex, setCurrentMaterialIndex] = useState<
    number | null
  >(0)

  const setWordingButton = (isBatch: boolean, isUpdateAble: boolean) => {
    if (isUpdateAble) {
      if (isBatch) {
        return t('selfDisposal:create.action.update_batch_quantity')
      }
      return t('selfDisposal:create.action.update_detail_quantity')
    }

    if (isBatch) {
      return t('selfDisposal:create.action.add_batch_quantity')
    }
    return t('selfDisposal:create.action.add_detail_quantity')
  }

  const columnMaterial: ColumnDef<FormDataDetail>[] = [
    {
      header: 'SI.No.',
      cell: ({ row: { index } }) => index + 1,
    },
    {
      header: t('selfDisposal:create.disposal_table.material_info'),
      cell: ({ row }) => {
        return (
          <div>
            <div className="ui-text-gray-800 ui-font-semibold">
              {row.original.material.name}
            </div>
            <div>{row.original.activity.name}</div>
          </div>
        )
      },
    },
    {
      header: t('selfDisposal:create.disposal_table.stock_of_disposal'),
      cell: ({ row }) => {
        return <div>{numberFormatter(row.original.disposal_qty, language)}</div>
      },
    },

    {
      header: t('selfDisposal:create.disposal_table.quantity'),
      cell: ({ row }) => {
        const isUpdate = row.original.items.some(x => x.disposals.some(y => !!y.disposal_discard_qty || !!y.disposal_received_qty))

        return (
          <div>
            {row.original.items.map((item) => {
              let sum = 0

              for (const disposal of item.disposals) {
                const disposal_discard_qty = disposal?.disposal_discard_qty || 0
                const disposal_received_qty =
                  disposal?.disposal_received_qty || 0
                sum += disposal_discard_qty + disposal_received_qty
              }

              if (sum === 0) {
                return null
              }

              return (
                <div className="ui-space-y-1 mb-3">
                  {item.batch?.code ? (
                    <div className="ui-font-semibold">{item.batch?.code}</div>
                  ) : null}
                  <div>
                    {item.disposals.map((disposal) => {
                      const disposal_discard_qty =
                        disposal?.disposal_discard_qty || 0

                      const disposal_received_qty =
                        disposal?.disposal_received_qty || 0

                      const total = disposal_discard_qty + disposal_received_qty

                      if (total === 0) {
                        return null
                      }
                      return (
                        <div className="ui-flex ui-space-x-1">
                          <div>{disposal.transaction_reason.title}</div>
                          <div>:</div>
                          <div>{total}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <Button
              leftIcon={isUpdate ? undefined : <PlusIcon className="h-5 w-5"></PlusIcon>}
              variant="outline"
              onClick={() => {
                setIsOpen(true)
                setCurrentMaterialIndex(row.index)
              }}
            >
              {setWordingButton(row.original.material.is_managed_batch, isUpdate)}
            </Button>
            <FormErrorMessage>
              {errors?.materials?.[row.index]?.message}
            </FormErrorMessage>
          </div>
        )
      },
    },
    {
      header: t('selfDisposal:create.disposal_table.action'),
      accessorKey: 'no',
      cell: ({ row: { index } }) => (
        <div>
          <Button
            id={`btn-delete-${index}`}
            size="sm"
            variant="subtle"
            color="danger"
            className="ui-p-[6px]"
            onClick={() => {
              remove(index)
            }}
          >
            {t('common:remove')}
          </Button>
        </div>
      ),
    },
  ]

  const materials = watch('materials') || []

  const currentMaterial =
    currentMaterialIndex !== null ? materials[currentMaterialIndex] : undefined

  const [isOpen, setIsOpen] = useState(false)
  const [isOpenConfirmation, setIsOpenConfirmation] = useState(false)
  const [openConfirmationChange, setOpenConfirmationChange] = useState<{
    open: boolean
    payload: ValueChange | null
  }>({
    open: false,
    payload: null
  })

  const handleCloseConfirmationChange = () => setOpenConfirmationChange({
    open: false,
    payload: null
  })

  const handleConfirmChange = () => {
    if (openConfirmationChange) {
      if (openConfirmationChange.payload) {
        const payload = openConfirmationChange.payload as ValueChange
        if (payload.type === 'entity') {
          //@ts-ignore
          methods.setValue('entity', payload.value)
          //@ts-ignore
          methods.setValue('activity', null)
          //@ts-ignore
          methods.setValue('disposal_method', null)
          methods.setValue('materials', [])
        } else if (payload.type === 'activity') {
          //@ts-ignore
          methods.setValue('activity', payload.value)
          //@ts-ignore
          methods.setValue('disposal_method', null)
          methods.setValue('materials', [])
        } else if (payload.type === 'flow') {
          //@ts-ignore
          methods.setValue('disposal_method', payload.value)
          methods.setValue('materials', [])
          reValidateQueryFetchInfiniteScroll()
        } else if (payload.type === 'material') {
          remove(payload.value)
        }
      }
    }

    handleCloseConfirmationChange()
  }

  return (
    <Container
      title={t('selfDisposal:create_title')}
      withLayout
      backButton={{
        show: true,
        onClick: () => {
          router.push('/v5/self-disposal')
        },
      }}
    >
      <Meta title={generateMetaTitle(t('selfDisposal:create_title'))} />
      <SelfDisposalModalConfirmationChange
        open={openConfirmationChange.open}
        handleClose={handleCloseConfirmationChange}
        handleSubmit={handleConfirmChange}
      />
      <SelfDisposalCreateModalReset />
      <div className="ui-space-y-6">
        {/* <pre className="ui-text-xs">{JSON.stringify(watch(), null, 2)}</pre> */}
        {/* <pre className="ui-text-xs">{JSON.stringify(errors, null, 2)}</pre> */}
        <FormProvider {...methods}>
          <form id="parent" onSubmit={methods.handleSubmit(onSubmit)}>
            <div className="ui-flex ui-space-x-5">
              <SelfDisposalCreateDetailDisposal
                isSuperAdmin={isSuperAdmin}
                setOpenConfirmationChange={(payload: ValueChange) => setOpenConfirmationChange({ open: true, payload })}
              />
              <SelfDisposalCreateListStock
                setOpenConfirmationChange={(index: number) => setOpenConfirmationChange({
                  open: true, payload: { type: 'material', value: index }
                })}
              />
            </div>
          </form>
          <div className="ui-mt-5 ui-w-full ui-p-6 ui-pb-4 ui-border ui-border-gray-300 ui-rounded">
            <h1 className="ui-font-bold ui-text-dark-blue ui-mb-5">
              {t('selfDisposal:create.disposal_table.title')}
            </h1>

            <DataTable columns={columnMaterial} data={materials} />
            <DetailMaterial
              isOpen={isOpen}
              key={currentMaterial?.material?.id}
              data={currentMaterial}
              onClose={() => {
                setIsOpen(false)
                setTimeout(() => {
                  setCurrentMaterialIndex(null)
                }, 500)
              }}
              onSubmit={(data: FormDataDetail) => {
                if (currentMaterialIndex !== null) {
                  update(currentMaterialIndex, data)
                  methods.clearErrors(`materials.${currentMaterialIndex}`)
                }
              }}
            />
            <SelfDisposalCreateConfirmation
              open={isOpenConfirmation}
              onClose={() => {
                setIsOpenConfirmation(false)
              }}
            ></SelfDisposalCreateConfirmation>
          </div>

          <div className="ui-flex ui-space-x-5 ui-justify-end ui-mt-3">
            <Button
              variant="outline"
              className="ui-w-48"
              type="button"
              onClick={() => setModalReset(true)}
            >
              Reset
            </Button>
            <Button
              type="submit"
              form="parent"
              className="ui-w-48"
              color="primary"
              disabled={!materials || materials?.length === 0}
            >
              {t('common:send')}
            </Button>
          </div>
        </FormProvider>
      </div>
    </Container>
  )
}

function DetailMaterial({
  isOpen,
  data,
  onClose,
  onSubmit,
}: {
  isOpen: boolean
  data?: FormDataDetail
  onClose: () => void
  onSubmit: (data: FormDataDetail) => void
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'selfDisposal'])

  const form = useForm<FormDataDetail>({
    resolver: yupResolver(schemaDetail),
    defaultValues: data,
  })

  const { control, reset, setValue } = form

  const { fields, append } = useFieldArray({
    control: control,
    name: 'items',
  })

  const [modalWarning, setModalWarning] = useState(false)

  const selected_activities = form.watch('selected_activities') || []

  const _onSubmit: SubmitHandler<FormDataDetail> = (data) => {
    let totalQty = 0

    for (const item of data.items) {
      for (const disposal of item.disposals) {
        const disposal_discard_qty = disposal?.disposal_discard_qty || 0
        const disposal_received_qty = disposal?.disposal_received_qty || 0

        totalQty = totalQty + disposal_discard_qty
        totalQty = totalQty + disposal_received_qty
      }
    }

    if (totalQty === 0) {
      setModalWarning(true)
      return
    }

    onSubmit(data)
    onClose()
  }

  const watchedItems = form.watch('items')

  const handleReset = () => {
    let newItems = [...watchedItems]

    newItems = newItems.map(x => ({
      ...x,
      disposals: x.disposals.map(y => ({
        ...y,
        disposal_discard_qty: null,
        disposal_received_qty: null,
      }))
    }))

    setValue('items', newItems)
  }

  return (
    <Drawer
      open={isOpen}
      placement="bottom"
      sizeHeight="lg"
      size="full"
      className="ui-z-10"
    >
      <DrawerHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {data?.material?.is_managed_batch ? 'Batch Quantity' : 'Quantity'}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={onClose}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border ui-border-gray-300 ">
        <SelfDisposalCreateWarning
          isOpen={modalWarning}
          onClose={() => {
            setModalWarning(false)
          }}
        />
        <form
          id="detail"
          className="ui-py-5 ui-px-5 ui-space-y-5"
          onSubmit={form.handleSubmit(_onSubmit)}
        >
          <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mb-1">
            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('selfDisposal:create.material_table.material_name')}
              </h2>
              <p className="ui-font-bold ui-text-primary-800 ui-break-normal">
                {data?.material?.name}
              </p>
            </div>

            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('selfDisposal:create.disposal_table.stock_of_disposal')}
              </h2>
              <p className="ui-font-bold ui-text-primary-800">
                {numberFormatter(data?.disposal_qty, language)}
              </p>
            </div>

            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('selfDisposal:table.activity')}
              </h2>
              <p className="ui-font-bold ui-text-primary-800">
                {data?.activity?.name}
              </p>
            </div>
          </div>
          <Table
            withBorder
            rounded
            hightlightOnHover
            overflowXAuto={false}
            stickyOffset={0}
            verticalAlignment="center"
          >
            <Thead className="ui-bg-slate-100">
              <Tr>
                <Th className="ui-w-[5px] ui-font-semibold">SI.No.</Th>
                {data?.material?.is_managed_batch ? (
                  <Th className="ui-w-[20%] ui-font-semibold">
                    {t('selfDisposal:create.disposal_batch_table.batch_info')}
                  </Th>
                ) : null}

                <Th className=" ui-font-semibold">
                  {t('selfDisposal:table.activity')}
                </Th>
                <Th className=" ui-font-semibold">
                  {t(
                    'selfDisposal:create.disposal_batch_table.stock_from_discard'
                  )}
                </Th>
                <Th className=" ui-font-semibold" style={{ width: 280 }}  >
                  {t(
                    'selfDisposal:create.disposal_batch_table.qty_stock_from_discard'
                  )}
                </Th>
                <Th className=" ui-font-semibold">
                  {t(
                    'selfDisposal:create.disposal_batch_table.stock_from_received'
                  )}
                </Th>
                <Th className=" ui-font-semibold" style={{ width: 280 }}>
                  {t(
                    'selfDisposal:create.disposal_batch_table.qty_stock_from_received'
                  )}
                </Th>
              </Tr>
            </Thead>
            <Tbody className="">
              {fields.map((item, index) => {
                const itemValue = watchedItems[index]

                return (
                  <Tr key={item.id} className="ui-text-sm ui-font-normal">
                    <Td className="ui-content-start">{index + 1}</Td>
                    {data?.material?.is_managed_batch ? (
                      <Td className="ui-content-start">
                        {item.batch ? (
                          <div className="ui-space-y-2">
                            <div className="ui-font-semibold ui-text-gray-800">
                              <span>{item.batch.code}</span>
                            </div>
                            <div>
                              <span>
                                {t(
                                  'selfDisposal:create.disposal_batch_table.production_date'
                                )}
                                {' : '}
                              </span>
                              <span>
                                {parseDateTime(
                                  item.batch.production_date ?? undefined,
                                  'DD MMM YYYY',
                                  language
                                ).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span>
                                {t(
                                  'selfDisposal:create.disposal_batch_table.manufacturer'
                                )}
                                {' : '}
                              </span>
                              <span>{item.batch.manufacture?.name}</span>
                            </div>
                            <div>
                              <span>
                                {t(
                                  'selfDisposal:create.disposal_batch_table.expired_date'
                                )}
                                {' : '}
                              </span>
                              <span>
                                {parseDateTime(
                                  item.batch.expired_date ?? undefined,
                                  'DD MMM YYYY',
                                  language
                                ).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : null}
                      </Td>
                    ) : null}

                    <Td className="ui-content-start">
                      {itemValue?.activity?.name}
                    </Td>
                    <Td className="ui-content-start">
                      {numberFormatter(item.disposal_discard_qty, language)}
                    </Td>
                    <Td className="ui-content-start ui-space-y-3">
                      {itemValue.disposals?.map((i, indexDisposal) => (
                        <Controller
                          key={i.id}
                          control={control}
                          name={`items.${index}.disposals.${indexDisposal}.disposal_discard_qty`}
                          render={({
                            field: { value, onChange, ...field },
                            fieldState: { error },
                          }) => {
                            return (
                              <FormControl>
                                <FormLabel>
                                  {i.transaction_reason?.title}
                                  {` (${numberFormatter(i.max_disposal_discard_qty, language)})`}
                                </FormLabel>
                                <InputNumberV2
                                  id={`items.${index}.disposals.${indexDisposal}.disposal_discard_qty`}
                                  type="text"
                                  onValueChange={(values: any) => {
                                    const { floatValue } = values
                                    onChange(floatValue ?? null)
                                  }}
                                  placeholder={t(
                                    'selfDisposal:create.disposal_batch_table.enter_qty'
                                  )}
                                  error={!!error?.message}
                                  value={value ?? ''}
                                />
                                {error?.message && (
                                  <FormErrorMessage>
                                    {error?.message}
                                  </FormErrorMessage>
                                )}
                              </FormControl>
                            )
                          }}
                        ></Controller>
                      ))}
                    </Td>
                    <Td className="ui-content-start">
                      {numberFormatter(item.disposal_received_qty, language)}
                    </Td>
                    <Td className="ui-content-start ui-space-y-3">
                      {itemValue.disposals?.map(
                        (itemDisposal, indexDisposal) => (
                          <Controller
                            key={itemDisposal.id}
                            control={control}
                            name={`items.${index}.disposals.${indexDisposal}.disposal_received_qty`}
                            render={({
                              field: { value, onChange, ...field },
                              fieldState: { error },
                            }) => {
                              return (
                                <FormControl>
                                  <FormLabel>
                                    {itemDisposal.transaction_reason?.title}
                                    {` (${numberFormatter(itemDisposal.max_disposal_received_qty, language)})`}
                                  </FormLabel>
                                  <InputNumberV2
                                    id={`items.${index}.disposals.${indexDisposal}.disposal_received_qty`}
                                    type="text"
                                    onValueChange={(values: any) => {
                                      const { floatValue } = values
                                      onChange(floatValue ?? null)
                                    }}
                                    placeholder={t(
                                      'selfDisposal:create.disposal_batch_table.enter_qty'
                                    )}
                                    error={!!error?.message}
                                    value={value ?? ''}
                                  />
                                  {error?.message && (
                                    <FormErrorMessage>
                                      {error?.message}
                                    </FormErrorMessage>
                                  )}
                                </FormControl>
                              )
                            }}
                          ></Controller>
                        )
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
            <TableEmpty>
              <EmptyState
                title={t('common:message.empty.title')}
                description={t('common:message.empty.description')}
                withIcon
              />
            </TableEmpty>
          </Table>
          {/* 
          // hide take from another activity
          <div className="ui-inline-flex ui-items-center ui-space-x-3 ui-w-full ">
            <div className="ui-text-gray-800 ui-flex ui-items-center ui-space-x-2">
              <span>
                <PlusIcon className="ui-size-6"></PlusIcon>
              </span>
              <span>
                {t(
                  'selfDisposal:create.disposal_batch_table.take_from_another_activity'
                )}
              </span>
            </div>
            <ReactSelect
              className="ui-w-1/4"
              menuPosition="fixed"
              placeholder={t(
                'selfDisposal:create.disposal_batch_table.take_from_another_activity'
              )}
              key={selected_activities.length}
              options={data?.activities
                ?.filter((item) => !selected_activities.includes(item.id))
                .filter((item) => {
                  const otherItems = data?.other_items.filter(
                    (o) => o.activity.id === item?.id
                  )
                  if (otherItems.length > 0) {
                    return true
                  }
                  return false
                })
                .map((item) => {
                  return {
                    label: item.name,
                    value: item.id,
                  }
                })}
              isClearable
              onChange={(value: any) => {
                const otherItems = data?.other_items.filter(
                  (item) => item.activity.id === value?.value
                )
                if (otherItems) {
                  form.setValue('selected_activities', [
                    ...selected_activities,
                    value?.value,
                  ])
                  append(otherItems)
                  return
                }
              }}
            />
          </div> */}
        </form>
      </DrawerContent>
      <DrawerFooter>
        <DrawerFooter>
          <div className="ui-flex ui-gap-3">
            <Button
              variant="subtle"
              type="button"
              className="ui-mr-2"
              leftIcon={<Reload />}
              onClick={handleReset}
            >
              {t('common:reset')}
            </Button>
            <Button form="detail" type="submit" className="ui-w-48">
              {t('common:save')}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerFooter>
    </Drawer>
  )
}

export default SelfDisposalCreatePage
