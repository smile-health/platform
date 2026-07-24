import React from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { FormErrorMessage } from '#components/form-control'
import Plus from '#components/icons/Plus'
import XMark from '#components/icons/XMark'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateConsumptionPatientIdentity } from '../hooks/useTransactionCreateConsumptionPatientIdentity'
import { VACCINE_PROTOCOL } from '../transaction-consumption.constant'
import { PatientIdentityProps } from '../transaction-consumption.type'
import TransactionCreateConsumptionWithProtocol from './TransactionCreateConsumptionWithProtocol'
import PreviewPatiensRabies from './protocols/PreviewPatiensRabies'
import PreviewPatiensDengue from './protocols/PreviewPatiensDengue'
import cx from '#lib/cx'
import PreviewPatiens from './protocols/PreviewPatiens'

const TransactionCreateConsumptionPatientIdentity = ({
  item,
  setValueBatch,
  indexItem,
  isErrorBatch = false,
  indexParent,
  currentAllPatientId,
}: PatientIdentityProps) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const { openModal, setOpenModal, methods, handleSave, vaccineMethod } =
    useTransactionCreateConsumptionPatientIdentity({
      item,
      setValueBatch,
      indexItem,
      indexParent,
      currentAllPatientId,
    })
  const {
    reset,
    formState: { isValid },
  } = methods

  const buttonEdit = (
    <div className='ui-flex ui-justify-center ui-items-center'>
      <Button
        data-testid={`add-patient-batch-${indexItem}`}
        size="sm"
        variant="subtle"
        className="!ui-p-1"
        onClick={() => setOpenModal(true)}
      >
        {vaccineMethod?.is_multi_patient
          ? `${t('add')}/${t('table.column.edit')}`
          : t('table.column.edit')}
      </Button>
    </div>
  )

  return (
    <>
      {item.patients ? (
        <div className="ui-grid">
          {item.patients.map((x, index) => (
            <div
              className={cx("ui-grid ui-grid-cols-[48%_30%_22%] ui-gap-3 ui-px-2 ui-py-3", {
                'ui-bg-[#F5F5F4]': (item.patients?.length ?? 0) > 1 && index % 2 === 0,
                'ui-grid-cols-[60%_40%]': !item.protocol_id,
              })}
              key={`patient-${indexItem}-${index}`}
            >
              {item.protocol_id === VACCINE_PROTOCOL.RABIES && (
                <PreviewPatiensRabies
                  item={x}
                  buttonEdit={index === 0 ? buttonEdit : null}
                />
              )}
              {item.protocol_id === VACCINE_PROTOCOL.DENGUE && (
                <PreviewPatiensDengue
                  item={x}
                  buttonEdit={index === 0 ? buttonEdit : null}
                />
              )}
              {!item.protocol_id && (
                <PreviewPatiens
                  item={x}
                  buttonEdit={index === 0 ? buttonEdit : null}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="ui-flex ui-flex-col ui-px-2 ui-py-3">
          <Button
            className="ui-w-52"
            variant="outline"
            onClick={() => setOpenModal(true)}
            id={`add-patient-batch-${indexItem}`}
          >
            <div className="ui-text-dark-teal ui-flex ui-flex-row ui-space-x-3 ui-place-items-center">
              <span>
                <Plus></Plus>
              </span>
              <div>{t('table.button.vaccination_patient')}</div>
            </div>
          </Button>
          {isErrorBatch && (
            <FormErrorMessage>{t('validation.required')}</FormErrorMessage>
          )}
        </div>
      )}

      <FormProvider {...methods}>
        <Dialog
          open={openModal}
          closeOnOverlayClick={false}
          className="z-10"
          classNameOverlay="z-10"
          size="xl"
        >
          <DialogHeader border>
            <div className="ui-flex ui-justify-between">
              <div />
              <div className="ui-flex ui-flex-col ui-text-center ui-gap-2">
                <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
                  {t('patient_identity.label')}
                </h6>
                <p className="ui-text-base ui-text-neutral-500 ui-font-normal">
                  {t('patient_identity.description')}
                </p>
              </div>
              <Button
                variant="subtle"
                type="button"
                color="neutral"
                onClick={() => {
                  reset()
                  setOpenModal(false)
                }}
              >
                <XMark />
              </Button>
            </div>
          </DialogHeader>

          <TransactionCreateConsumptionWithProtocol
            indexItem={indexItem}
            item={item}
            setValueBatch={setValueBatch}
            methods={methods}
            indexParent={indexParent}
          />

          <DialogFooter className="ui-border ui-flex ui-flex-row">
            <Button
              color="danger"
              variant="default"
              className="w-full"
              onClick={() => {
                reset()
                setOpenModal(false)
              }}
              type="button"
              id={`cancel-patient-${indexItem}`}
              data-testid={`cancel-patient-${indexItem}`}
            >
              {t('cancel')}
            </Button>

            <Button
              variant="solid"
              className="w-full"
              onClick={handleSave}
              disabled={!isValid}
              id={`save-patient-${indexItem}`}
              data-testid={`save-patient-${indexItem}`}
            >
              {t('save')}
            </Button>
          </DialogFooter>
        </Dialog>
      </FormProvider>
    </>
  )
}

export default TransactionCreateConsumptionPatientIdentity
