import React, { useEffect, useState } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { numberFormatter } from '#utils/formatter'
import {
  FieldErrors,
  FormProvider,
  SubmitHandler,
  UseFormSetValue,
  UseFormTrigger,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TransactionCreateConsumptionBatch } from '../hooks/useTransactionCreateConsumptionBatch'
import { useTransactionCreateConsumptionSetDataPatientId } from '../hooks/useTransactionCreateConsumptionSetDataPatientId'
import { useDataPatientIds } from '../store/consumption-detail.store'
import {
  CreateTransactionChild,
  CreateTransactionConsumption,
} from '../transaction-consumption.type'
import TransactionCreateConsumptionTableDetail from './TransactionCreateConsumptionTableDetail'
import TransactionCreateConsumptionWarningPopup from './TransactionCreateConsumptionWarningPopup'

type Props = {
  handleClose: (value: boolean) => void
  isOpen: boolean
  idRow: number
  items: CreateTransactionConsumption['items']
  setValueParent: UseFormSetValue<CreateTransactionConsumption>
  triggerParent: UseFormTrigger<CreateTransactionConsumption>
  errorsParent: FieldErrors<CreateTransactionConsumption>
}

const TransactionCreateConsumptionDetail: React.FC<Props> = ({
  handleClose,
  isOpen,
  idRow,
  items,
  setValueParent,
  triggerParent,
  errorsParent,
}) => {
  const batches = items?.[idRow]?.batches
  const { methods, resetBatch, checkValidity } =
    TransactionCreateConsumptionBatch()
  const { groupPatientIdByNik } =
    useTransactionCreateConsumptionSetDataPatientId()
  const {
    t,
    i18n: { language },
  } = useTranslation('transactionCreateConsumption')
  const { patientIds } = useDataPatientIds()
  const [warningDuplicateSequence, setWarningDuplicateSequence] = useState({
    open: false,
    description: '',
    callback: () => {},
  })

  useEffect(() => {
    methods.reset({
      batches,
      all_patient_id: patientIds,
    })
  }, [batches, isOpen, methods.reset])

  const onSubmit: SubmitHandler<CreateTransactionChild> = (data) => {
    let duplicatePatients: any[] = []

    if (data?.batches) {
      for (const batch of data.batches) {
        if (batch.patients) {
          for (const patient of batch.patients) {
            const previousSequenceId = patient.history_vaccination?.previous_sequence?.id
            const currentSequenceValue = patient.vaccination?.vaccine_sequence?.value
            if (
              previousSequenceId &&
              currentSequenceValue &&
              previousSequenceId === currentSequenceValue
            ) {
              duplicatePatients.push(patient)
            }
          }
        }
      }
    }

    const proceedSubmit = () => {
      if (data?.batches) {
        setValueParent(`items.${idRow}.batches`, data.batches)
        triggerParent([`items.${idRow}.batches`])
        handleClose(false)
        groupPatientIdByNik(items)
      }
    }

    if (duplicatePatients.length > 0) {
      const patientIds = duplicatePatients
        .map(
          (p) =>
            p.patient?.nik || p.identity?.nik || p.vaccination?.patient_id
        )
        .filter(Boolean)
        .join(', ')

      const sequences = Array.from(
        new Set(
          duplicatePatients.map(
            (p) =>
              p.history_vaccination?.previous_sequence?.name ||
              p.vaccination?.vaccine_sequence?.label
          )
        )
      )
        .filter(Boolean)
        .join(', ')

      setWarningDuplicateSequence({
        open: true,
        description: t('patient_identity.warning_duplicate_sequence.description', {
          patient_id: patientIds,
          sequence: sequences,
        }),
        callback: proceedSubmit,
      })
    } else {
      proceedSubmit()
    }
  }
  useEffect(() => {
    if (errorsParent?.items?.[idRow]?.batches)
      methods.setError('batches', errorsParent?.items?.[idRow].batches)
  }, [errorsParent?.items?.[idRow]?.batches])

  return (
    <FormProvider {...methods}>
      <TransactionCreateConsumptionWarningPopup
        open={warningDuplicateSequence.open}
        description={warningDuplicateSequence.description}
        handleSubmit={warningDuplicateSequence.callback}
        handleClose={() =>
          setWarningDuplicateSequence((prev) => ({ ...prev, open: false }))
        }
        isDanger={true}
      />
      <Drawer
        placement="bottom"
        open={isOpen}
        size="full"
        sizeHeight="lg"
        closeOnOverlayClick={false}
        onOpenChange={handleClose}
      >
        <DrawerHeader className="ui-border">
          <div className="ui-flex ui-justify-between">
            <div />
            <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
              {t('caption_detail_batch', {
                type: items?.[idRow]?.managed_in_batch ? 'Batch' : 'Detail',
              })}
            </h6>
            <Button
              id={`close-batch-${idRow}`}
              data-testid={`close-batch-${idRow}`}
              variant="subtle"
              type="button"
              color="neutral"
              onClick={() => handleClose(false)}
            >
              <XMark />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerContent className="ui-p-4 ui-space-y-6">
          <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mb-1">
            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                Material
              </h2>
              <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                {items?.[idRow]?.material_name}
              </p>
            </div>
            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('table.column.stock_on_hand')}
              </h2>
              <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                {numberFormatter(items?.[idRow]?.on_hand_stock, language)}

                <span className="ui-text-neutral-500 ui-text-xs ui-font-normal ui-ml-1">
                  min: {numberFormatter(items?.[idRow]?.min, language)},{' '}
                  {t('max')} : {numberFormatter(items?.[idRow]?.max, language)}
                </span>
              </p>
            </div>
            <div>
              <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                {t('table.column.available_stock')}
              </h2>
              <p className="ui-font-bold ui-text-primary-800 ui-mb-1">
                {numberFormatter(items?.[idRow]?.available_stock, language)}
              </p>
            </div>
          </div>
          <TransactionCreateConsumptionTableDetail
            indexData={idRow}
            items={items?.[idRow]}
          />
        </DrawerContent>
        <DrawerFooter className="ui-border">
          <button
            id={`reset-batch-${idRow}`}
            data-testid={`reset-batch-${idRow}`}
            type="button"
            onClick={() => {
              methods.setValue(
                'batches',
                resetBatch({
                  currentBatch: batches,
                })
              )
              methods.clearErrors('batches')
            }}
            className="ui-w-20 focus:outline-none"
          >
            <div className="ui-flex ui-flex-row ui-text-sm ui-space-x-3 ui-text-primary-600">
              <Reload className="ui-size-5" />
              <div>Reset</div>
            </div>
          </button>

          <Button
            id={`save-batch-${idRow}`}
            data-testid={`save-batch-${idRow}`}
            className="ui-w-48"
            onClick={() => {
              checkValidity()
              methods.handleSubmit(onSubmit)()
            }}
          >
            {t('save')}
          </Button>
        </DrawerFooter>
      </Drawer>
    </FormProvider>
  )
}

export default TransactionCreateConsumptionDetail
