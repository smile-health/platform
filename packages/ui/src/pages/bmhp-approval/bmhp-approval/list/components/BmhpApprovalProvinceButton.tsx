import React from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import { useBmhpApprovalProvince } from '../hooks/useBmhpApprovalProvince'

interface BmhpApprovalProvinceButtonProps {
  programPlanId?: number
  disabled?: boolean
}

const BmhpApprovalProvinceButton: React.FC<BmhpApprovalProvinceButtonProps> = ({
  programPlanId,
  disabled,
}) => {
  const { t } = useTranslation(['bmhpApproval'])
  const { submitToMOH, isSubmitting } = useBmhpApprovalProvince()

  if (!programPlanId) return null

  return (
    <Button
      id="btn-submit-to-moh"
      variant="solid"
      // size="lg"
      className="ui-w-fit ui-px-10"
      leftIcon={<PaperAirplaneIcon className="ui-size-6" />}
      loading={isSubmitting}
      disabled={isSubmitting || disabled}
      onClick={() => submitToMOH(programPlanId)}
    >
      {t('bmhpApproval:button.submit_to_moh')}
    </Button>
  )
}

export default BmhpApprovalProvinceButton
