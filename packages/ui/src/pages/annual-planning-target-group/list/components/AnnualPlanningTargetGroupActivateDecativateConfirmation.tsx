import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { useActivateDeactivateAnnualPlanningTargetGroupRow } from '../../form/hooks/useActivateDeactivateAnnualPlanningTargetGroupRow'
import AnnualPlanningTargetGroupListContext from '../libs/annual-planning-target-group-list.context'

const AnnualPlanningTargetGroupActivateDecativateConfirmation = () => {
  const { t } = useTranslation(['annualPlanningTargetGroup'])

  const { openedRow, setOpenedRow, isGlobal } = useContext(
    AnnualPlanningTargetGroupListContext
  )

  const deactivationDescription = t(
    'annualPlanningTargetGroup:confirmation_activation.description',
    {
      status: openedRow?.is_active
        ? t('annualPlanningTargetGroup:table.deactivate').toLowerCase()
        : t('annualPlanningTargetGroup:table.activate').toLowerCase(),
    }
  )

  const deactivationSubDescription = openedRow?.is_active
    ? t(
        'annualPlanningTargetGroup:confirmation_activation.description_deactivate'
      )
    : t(
        'annualPlanningTargetGroup:confirmation_activation.subdescription_activate'
      )

  const { mutate, isPending } =
    useActivateDeactivateAnnualPlanningTargetGroupRow()

  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setTimeout(() => {
      if (openedRow?.opened_for === 'activation') setOpenedRow(null)
    }, 300)
    setIsOpen(false)
  }, [setOpenedRow, openedRow])

  useEffect(() => {
    if (openedRow?.opened_for === 'activation') setIsOpen(true)
    else handleClose()
  }, [openedRow, handleClose])

  const buttonTypeGlobal = openedRow?.is_active ? 'delete' : 'update'
  const buttonTypeProgram = 'delete'

  useSetLoadingPopupStore(isPending)

  return (
    <ModalConfirmation
      open={isOpen}
      setOpen={(open) => {
        if (!open) handleClose()
      }}
      type={isGlobal ? buttonTypeGlobal : buttonTypeProgram}
      description={
        isGlobal
          ? deactivationDescription
          : t('annualPlanningTargetGroup:confirmation_deletion.description')
      }
      subDescription={
        isGlobal
          ? deactivationSubDescription
          : t('annualPlanningTargetGroup:confirmation_deletion.subdescription')
      }
      onSubmit={mutate}
    />
  )
}

export default AnnualPlanningTargetGroupActivateDecativateConfirmation
