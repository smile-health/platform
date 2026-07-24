import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import CheckCircleIcon from '#components/icons/CheckCircleIcon'
import CrossCircleIcon from '#components/icons/CrossCircleIcon'
import JustCircleIcon from '#components/icons/JustCircleIcon'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { useMarkAsFinalProgramPlanRow } from '../../form/hooks/useMarkAsFinalProgramPlanRow'
import { statusConverter } from '../libs/program-plan-list.common'
import ProgramPlanContext from '../libs/program-plan-list.context'

type ProgramPlanTab =
  | 'target_group'
  | 'population'
  | 'needs_calculation'
  | 'material_ratio'
  | 'material_substitution'

const ProgramPlanMarkAsFinalModal = () => {
  const { t } = useTranslation(['common', 'programPlan'])

  const { mutate, isPending } = useMarkAsFinalProgramPlanRow()

  const { popUpDataRow, setPopUpDataRow } = useContext(ProgramPlanContext)
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = useCallback(() => {
    setTimeout(() => setPopUpDataRow(null), 300)
    setIsOpen(false)
  }, [setPopUpDataRow])

  useEffect(() => {
    if (popUpDataRow) setIsOpen(true)
    else handleClose()
  }, [popUpDataRow, handleClose])

  useSetLoadingPopupStore(isPending)

  return (
    <Dialog
      open={isOpen}
      size="lg"
      onOpenChange={(isOpened) => {
        if (!isOpened) handleClose()
      }}
    >
      <DialogCloseButton onClick={handleClose} />
      <DialogHeader className="ui-text-center ui-text-xl">
        <div className="ui-flex ui-flex-col ui-gap-2">
          <h5 className="ui-font-semibold ui-text-dark-teal ui-text-xl">
            {t('common:confirmation')}
          </h5>
          <h6 className="ui-font-normal ui-text-neutral-500 ui-text-base">
            {t('programPlan:confirmation_activation.description')}
          </h6>
        </div>
      </DialogHeader>
      <DialogContent>
        <p className="ui-text-dark-teal ui-mb-2">
          {t('programPlan:confirmation_activation.subdescription_top')}
        </p>
        <div className="ui-mb-2">
          {popUpDataRow?.status
            ? statusConverter(popUpDataRow.status)?.map((item, index) => (
                <div
                  key={index?.toString()}
                  className="ui-flex ui-items-center ui-gap-2 ui-mb-1"
                >
                  {item.status && <CheckCircleIcon />}
                  {!item.status && item.required && <CrossCircleIcon />}
                  {!item.status && !item.required && <JustCircleIcon />}
                  <span
                    className={cx(
                      'ui-font-medium',
                      item.status ? 'ui-text-green-700' : 'ui-text-red-600',
                      !item.required && !item.status && 'ui-text-neutral-500'
                    )}
                  >
                    {t(
                      `programPlan:tabs.${item.name}` as `programPlan:tabs.${ProgramPlanTab}`
                    )}
                    {!item.required && ` (${t('programPlan:optional')})`}
                  </span>
                </div>
              ))
            : null}
        </div>
        <p className="ui-text-neutral-500">
          {t('programPlan:confirmation_activation.subdescription_bottom')}
        </p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
          <Button
            id="btn_close_pop_up_form_program_plan"
            variant="default"
            type="button"
            onClick={handleClose}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn_finalize_pop_up_form_for_program_plan"
            type="button"
            disabled={statusConverter(popUpDataRow?.status ?? null).some(
              (item) => item.required && !item.status
            )}
            onClick={() => mutate()}
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default ProgramPlanMarkAsFinalModal
