import React, { useCallback, useContext, useEffect, useState } from 'react'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { useDeleteAnnualPlanningSubstitutionRow } from '../../form/hooks/useDeleteAnnualPlanningSubstitutionRow'
import AnnualPlanningSubstitutionListContext from '../libs/annual-planning-substitution-list.context'

const AnnualPlanningSubstitutionDeleteRowConfirmation = () => {
  const { t } = useTranslation(['common', 'annualPlanningSubstitution'])
  const { mutate, isPending } = useDeleteAnnualPlanningSubstitutionRow()
  const { openedRow, setOpenedRow } = useContext(
    AnnualPlanningSubstitutionListContext
  )
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setTimeout(() => setOpenedRow(null), 300)
    setIsOpen(false)
  }, [setOpenedRow])

  useEffect(() => {
    if (openedRow) setIsOpen(true)
    else handleClose()
  }, [openedRow, handleClose])

  useSetLoadingPopupStore(isPending)

  return (
    <ModalConfirmation
      open={isOpen}
      setOpen={(open) => {
        if (!open) {
          setOpenedRow(null)
        }
      }}
      type="delete"
      description={t('annualPlanningSubstitution:deletion.description')}
      subDescription={t('annualPlanningSubstitution:deletion.subdescription')}
      onSubmit={mutate}
    />
  )
}

export default AnnualPlanningSubstitutionDeleteRowConfirmation
