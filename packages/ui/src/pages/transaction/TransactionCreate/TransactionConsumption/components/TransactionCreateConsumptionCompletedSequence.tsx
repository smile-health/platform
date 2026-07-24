import React, { Fragment, useContext, useMemo } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import XMark from '#components/icons/XMark'
import { TFunction } from 'i18next'
import { FormProvider } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useTransactionCreateConsumptionFormCompletedSequence } from '../hooks/useTransactionCreateConsumptionFormCompletedSequence'
import { useOpenCompletedSequenceStore } from '../store/completed-sequence.store'
import { VACCINE_PROTOCOL } from '../transaction-consumption.constant'
import {
  MaterialCompletedSequenceForm,
} from '../transaction-consumption.type'
import { CompleteSequenceContext } from '../context/CompleteSequenceContext'
import CompleteSequenceRabiesForm from './complete-sequence/CompleteSequenceRabiesForm'
import CompleteSequenceDengueForm from './complete-sequence/CompleteSequenceDengueForm'

type Props = {
  entity_id?: number | null
  activity_id?: number | null
  protocol_id?: number | null
}

const TransactionCreateConsumptionCompletedSequence: React.FC<Props> = (props) => {
  const { entity_id, activity_id, protocol_id } = props
  const { setIsOpenCompletedSequence, isOpenCompletedSequence } =
    useOpenCompletedSequenceStore()
  const { t } = useTranslation('transactionCreateConsumption')
  const { methods, handleSave } =
    useTransactionCreateConsumptionFormCompletedSequence()
  const { watch } = methods
  const { materials } = watch()

  const contextValue = useMemo(() => ({
    entity_id,
    activity_id,
    protocol_id: protocol_id || 0,
  }), [entity_id, activity_id, protocol_id])

  return (
    <CompleteSequenceContext.Provider value={contextValue}>
      <FormProvider {...methods}>
        <Drawer
          placement="bottom"
          open={isOpenCompletedSequence}
          size="full"
          sizeHeight="lg"
          closeOnOverlayClick={false}
          onOpenChange={setIsOpenCompletedSequence}
        >
          <DrawerHeader className="ui-border">
            <HeaderContent
              t={t}
              onClose={() => setIsOpenCompletedSequence(false)}
            />
          </DrawerHeader>
          <DrawerContent className="ui-p-4 ui-space-y-6">
            <div className="ui-flex ui-flex-col">
              {materials?.map((material, indexMaterial) => (
                <MaterialSection
                  key={`completed-material-${indexMaterial.toString()}`}
                  material={material}
                  indexMaterial={indexMaterial}
                />
              ))}
            </div>
          </DrawerContent>
          <DrawerFooter className="ui-border">
            <FooterButtons
              onCancel={() => setIsOpenCompletedSequence(false)}
              onSave={handleSave}
              t={t}
            />
          </DrawerFooter>
        </Drawer>
      </FormProvider>
    </CompleteSequenceContext.Provider>
  )
}

export const HeaderContent = ({
  t,
  onClose,
}: {
  t: TFunction<'transactionCreateConsumption'>
  onClose: () => void
}) => {
  const { protocol_id } = useContext(CompleteSequenceContext)
  let description = ''

  if (protocol_id === VACCINE_PROTOCOL.RABIES) {
    description = t('completed_sequence.description.rabies')
  }

  return (
    <div className="ui-flex ui-justify-between">
      <div />
      <div className="ui-flex ui-flex-col ui-text-center">
        <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
          {t('completed_sequence.confirmation')}
        </h6>
        {description && <p className="ui-text-neutral-500">{description}</p>}
      </div>
      <Button
        id="close-completed-sequence"
        data-testid="close-completed-sequence"
        variant="subtle"
        type="button"
        color="neutral"
        onClick={onClose}
      >
        <XMark />
      </Button>
    </div>
  )
}

export const FooterButtons = ({
  onCancel,
  onSave,
  t,
}: {
  t: TFunction<'transactionCreateConsumption'>
  onSave: () => void
  onCancel: () => void
}) => (
  <>
    <Button
      color="danger"
      variant="default"
      className="ui-w-48"
      id="cancel-close-completed-sequence"
      data-testid="cancel-close-completed-sequence"
      onClick={onCancel}
      type="button"
    >
      {t('cancel')}
    </Button>
    <Button
      id="save-close-completed-sequence"
      data-testid="save-close-completed-sequence"
      className="ui-w-48"
      onClick={onSave}
    >
      {t('save')}
    </Button>
  </>
)

export const MaterialSection = ({
  material,
  indexMaterial,
}: {
  material: MaterialCompletedSequenceForm
  indexMaterial: number
}) => {
  const { protocol_id } = useContext(CompleteSequenceContext)

  return (
    <>
      {material.patients.map((patient, indexPatient) => (
        <Fragment key={`patient-section-${indexMaterial.toString()}-${indexPatient.toString()}`}>
          {protocol_id === VACCINE_PROTOCOL.RABIES && (
            <CompleteSequenceRabiesForm
              key={`patient-section-${indexMaterial.toString()}-${indexPatient.toString()}`}
              patient={patient}
              indexMaterial={indexMaterial}
              indexPatient={indexPatient}
            />
          )}
          {protocol_id === VACCINE_PROTOCOL.DENGUE && (
            <CompleteSequenceDengueForm
              key={`patient-section-${indexMaterial.toString()}-${indexPatient.toString()}`}
              patient={patient}
              indexMaterial={indexMaterial}
              indexPatient={indexPatient}
            />
          )}
        </Fragment>
      ))}
    </>
  )
}

export default TransactionCreateConsumptionCompletedSequence
