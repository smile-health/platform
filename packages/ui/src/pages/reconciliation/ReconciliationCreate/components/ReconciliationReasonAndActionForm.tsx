import React from 'react'
import { Button } from '#components/button'
import {
  Dialog,
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
import Trash from '#components/icons/Trash'
import XMark from '#components/icons/XMark'
import { ReactSelectAsync } from '#components/react-select'
import ButtonPatient from '#pages/transaction/TransactionCreate/TransactionConsumption/components/ButtonPatient'
import {
  Controller,
  FieldErrors,
  FormProvider,
  UseFormClearErrors,
  UseFormSetValue,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useReconciliationReasonAndAction } from '../hooks/useReconciliationReasonAndAction'
import {
  loadActionReconciliation,
  loadReasonReconciliation,
} from '../reconciliation-create.services'
import {
  ReconciliationCreateForm,
  ReonciliationItems,
} from '../reconciliation-create.type'
import ReconciliationListReasonAndAction from './ReconciliationListReasonAndAction'

const ReconciliationReasonAndActionForm = ({
  item,
  setValueItem,
  indexItem,
  errorItem,
  clearErrorItem,
}: {
  item: ReonciliationItems
  setValueItem: UseFormSetValue<ReconciliationCreateForm>
  indexItem: number
  errorItem: FieldErrors<ReconciliationCreateForm>
  clearErrorItem: UseFormClearErrors<ReconciliationCreateForm>
}) => {
  const {
    methods,
    setOpenModal,
    openModal,
    handleSave,
    selectedIndex,
    setSelectedIndex,
    removeReason,
    addNewReason,
  } = useReconciliationReasonAndAction({
    item,
    setValueItem,
    indexItem,
    clearErrorItem,
  })
  const { t } = useTranslation('reconciliation')
  const {
    formState: { errors },
    watch,
    control,
    trigger,
  } = methods
  const { data } = watch()
  return (
    <div>
      {item?.actions && item?.actions?.length > 0 ? (
        <ReconciliationListReasonAndAction
          setOpenModal={setOpenModal}
          item={item}
        />
      ) : (
        <Button
          variant="outline"
          color="primary"
          onClick={(e) => {
            e.preventDefault()
            setOpenModal(true)
          }}
          id={`add__reason_create__reconciliation__${indexItem}`}
          data-testid={`add__reason_create__reconciliation__${indexItem}`}
          className="ui-w-28"
          disabled={item.actual_qty === item.recorded_qty}
        >
          <div className="ui-text-primary ui-flex ui-flex-row ui-space-x-3 ui-place-items-center">
            <span>
              <Plus></Plus>
            </span>
            <div>{t('create.add')}</div>
          </div>
        </Button>
      )}
      {errorItem.opname_stock_items?.[indexItem]?.actions?.message ||
      errorItem.opname_stock_items?.[indexItem]?.reasons?.message ? (
        <FormErrorMessage>{t('create.validation.required')}</FormErrorMessage>
      ) : null}
      <FormProvider {...methods}>
        <Dialog open={openModal} closeOnOverlayClick={false} size="xl">
          <DialogHeader border>
            <div className="ui-flex ui-justify-between">
              <div />
              <div className="ui-flex ui-flex-col ui-text-center">
                <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
                  {t('list.table.reason_action')}
                </h6>
              </div>
              <Button
                variant="subtle"
                type="button"
                color="primary"
                onClick={() => {
                  methods.reset()
                  setOpenModal(false)
                }}
              >
                <XMark />
              </Button>
            </div>
          </DialogHeader>
          <DialogContent className="!ui-p-0 !ui-overflow-hidden">
            <div className="ui-flex ui-flex-row ui-border-t ui-border-[#D2D2D2]">
              <div className="ui-w-64 ui-border-r ui-border-[#D2D2D2]">
                <div className="ui-flex ui-flex-col ui-max-h-[168px] ui-overflow-auto">
                  {data?.map((item, index) => (
                    <div
                      className="ui-flex ui-justify-between"
                      key={`reason-action-${index.toString()}`}
                    >
                      <ButtonPatient
                        id={`choose-reason-action-${index + 1}`}
                        isActive={selectedIndex === index}
                        onClick={() => setSelectedIndex(index)}
                        isError={
                          !!errors?.data?.[index]?.action ||
                          !!errors?.data?.[index]?.reason
                        }
                      >
                        {`${t('list.table.reason')} ${Number(index + 1)}`}
                      </ButtonPatient>
                      {index !== 0 ? (
                        <button
                          id={`btn-delete-reason-action-${index.toString()}`}
                          className="ui-text-dark-teal ui-pr-3"
                          type="button"
                          onClick={() => removeReason(index)}
                        >
                          <span>
                            <Trash className="ui-w-3"></Trash>
                          </span>
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
                <Button
                  variant="subtle"
                  className="ui-my-5"
                  type="button"
                  onClick={() => addNewReason()}
                  id={`add-new-patient-batch-${indexItem}`}
                  disabled={!!errors?.data}
                >
                  <div className="ui-flex ui-flex-row ui-space-x-1 ui-place-items-center">
                    <span className="ui-text-primary">
                      <Plus></Plus>
                    </span>
                    <div className="ui-text-dark-teal">
                      {t('create.add_new_reason')}
                    </div>
                  </div>
                </Button>
              </div>
              <div
                className="ui-w-full ui-p-5 ui-flex ui-flex-col ui-space-y-5"
                style={{ backgroundColor: '#FAFAFA' }}
              >
                <Controller
                  control={control}
                  name={`data.${selectedIndex}.reason`}
                  key={`reason-${indexItem}-${selectedIndex}`}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel htmlFor="select-reconciliation-reason">
                        {t('create.reason.label')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        key={`reason-${indexItem}-${selectedIndex}-${value}`}
                        id={`select-reconciliation-reason-${indexItem}-${selectedIndex}`}
                        data-testid={`select-reconciliation-reason-${indexItem}-${selectedIndex}`}
                        loadOptions={loadReasonReconciliation}
                        debounceTimeout={300}
                        value={value}
                        placeholder={t('create.reason.placeholder')}
                        additional={{
                          page: 1,
                        }}
                        onChange={(option) => {
                          onChange(option)
                          trigger([`data.${selectedIndex}.action`])
                        }}
                        menuPosition="fixed"
                        error={
                          !!error?.message ||
                          !!errors?.data?.[selectedIndex]?.action?.type
                        }
                        isClearable
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                      {errors?.data?.[selectedIndex]?.action?.type ===
                        'unique-combo' && (
                        <FormErrorMessage>
                          {t('create.validation.error_combination')}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
                <Controller
                  control={control}
                  name={`data.${selectedIndex}.action`}
                  key={`action-${indexItem}-${selectedIndex}`}
                  render={({
                    field: { value, onChange, ...field },
                    fieldState: { error },
                  }) => (
                    <FormControl>
                      <FormLabel htmlFor="select-reconciliation-action">
                        {t('create.action.label')}
                      </FormLabel>
                      <ReactSelectAsync
                        {...field}
                        key={`action-${indexItem}-${selectedIndex}-${value}`}
                        id={`select-reconciliation-action-${indexItem}-${selectedIndex}`}
                        data-testid={`select-reconciliation-action-${indexItem}-${selectedIndex}`}
                        loadOptions={loadActionReconciliation}
                        debounceTimeout={300}
                        value={value}
                        placeholder={t('create.action.placeholder')}
                        additional={{
                          page: 1,
                        }}
                        onChange={(option) => {
                          onChange(option)
                          trigger([`data.${selectedIndex}.reason`])
                        }}
                        menuPosition="fixed"
                        error={!!error?.message}
                        isClearable
                      />
                      {error?.message && (
                        <FormErrorMessage>{error?.message}</FormErrorMessage>
                      )}
                    </FormControl>
                  )}
                />
              </div>
            </div>
          </DialogContent>
          <DialogFooter className="ui-border ui-flex ui-flex-row">
            <Button
              color="danger"
              variant="default"
              className="w-full"
              onClick={() => {
                methods.reset()
                setOpenModal(false)
              }}
              type="button"
              id={`cancel-patient-${indexItem}`}
              data-testid={`cancel-patient-${indexItem}`}
            >
              {t('create.cancel')}
            </Button>

            <Button
              variant="solid"
              className="w-full"
              onClick={handleSave}
              disabled={!!errors?.data}
              id={`save-patient-${indexItem}`}
              data-testid={`save-patient-${indexItem}`}
            >
              {t('create.save')}
            </Button>
          </DialogFooter>
        </Dialog>
      </FormProvider>
    </div>
  )
}

export default ReconciliationReasonAndActionForm
