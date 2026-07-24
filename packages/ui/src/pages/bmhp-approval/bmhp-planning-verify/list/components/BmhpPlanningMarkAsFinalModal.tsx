import React from 'react'
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
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { useMarkAsFinalBmhpPlanning } from '../hooks/useMarkAsFinalBmhpPlanning'
import { BMHP_STATUS_PLANS } from '../libs/bmhp-planning-list.constants'
import { TBmhpPlanningYearStatus } from '../libs/bmhp-planning-list.type'

type BmhpPlanningChecklistItem =
  | 'master_pemeriksaan'
  | 'jenis_pemeriksaan'
  | 'method'
  | 'parameter'
  | 'variant'
  | 'material'

type Props = {
  open: boolean
  onClose: () => void
  status: TBmhpPlanningYearStatus | null | undefined
}

const BmhpPlanningMarkAsFinalModal: React.FC<Props> = ({
  open,
  onClose,
  status,
}) => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])

  const { mutate, isPending } = useMarkAsFinalBmhpPlanning(onClose)

  useSetLoadingPopupStore(isPending)

  const checklistItems = BMHP_STATUS_PLANS.map((item) => ({
    name: item.name,
    required: item.required,
    status: status?.[item.name as keyof TBmhpPlanningYearStatus] ?? false,
  }))

  const hasUnmetRequired = checklistItems.some(
    (item) => item.required && !item.status
  )

  return (
    <Dialog
      open={open}
      size="lg"
      onOpenChange={(isOpened) => {
        if (!isOpened) onClose()
      }}
    >
      <DialogCloseButton onClick={onClose} />
      <DialogHeader className="ui-text-center ui-text-xl">
        <div className="ui-flex ui-flex-col ui-gap-2">
          <h5 className="ui-font-semibold ui-text-dark-teal ui-text-xl">
            {t('common:confirmation')}
          </h5>
          <h6 className="ui-font-normal ui-text-neutral-500 ui-text-base">
            {t('bmhpPlanning:confirmation_activation.description')}
          </h6>
        </div>
      </DialogHeader>
      <DialogContent>
        <p className="ui-text-dark-teal ui-mb-2">
          {t('bmhpPlanning:confirmation_activation.subdescription_top')}
        </p>
        <div className="ui-mb-2">
          {checklistItems.map((item, index) => (
            <div
              key={index.toString()}
              className="ui-flex ui-items-center ui-gap-2 ui-mb-1"
            >
              {item.status ? <CheckCircleIcon /> : <CrossCircleIcon />}
              <span
                className={cx(
                  'ui-font-medium',
                  item.status ? 'ui-text-green-700' : 'ui-text-red-600'
                )}
              >
                {t(
                  `bmhpPlanning:checklist.${item.name}` as `bmhpPlanning:checklist.${BmhpPlanningChecklistItem}`
                )}
              </span>
            </div>
          ))}
        </div>
        <p className="ui-text-neutral-500">
          {t('bmhpPlanning:confirmation_activation.subdescription_bottom')}
        </p>
      </DialogContent>
      <DialogFooter className="ui-justify-center">
        <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
          <Button
            id="btn_close_pop_up_finalize_bmhp_planning"
            variant="default"
            type="button"
            onClick={onClose}
          >
            {t('common:cancel')}
          </Button>
          <Button
            id="btn_finalize_bmhp_planning"
            type="button"
            disabled={hasUnmetRequired}
            onClick={() => mutate()}
          >
            {t('common:yes')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default BmhpPlanningMarkAsFinalModal
