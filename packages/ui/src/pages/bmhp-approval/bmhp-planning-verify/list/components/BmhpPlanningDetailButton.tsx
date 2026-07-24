import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

type BmhpPlanningDetailButtonProps = {
  id: number
}

const BmhpPlanningDetailButton: React.FC<BmhpPlanningDetailButtonProps> = ({
  id,
}) => {
  const router = useSmileRouter()
  const { t } = useTranslation(['bmhpPlanning'])

  return (
    <Link
      href={router.getAsLink(`/v5/bmhp-planning/${id}/variant`)}
      className="ui-p-0 ui-space-x-2 ui-block ui-my-2 ui-w-fit"
    >
      <Button
        type="button"
        variant="subtle"
        className="ui-w-fit ui-p-0 hover:!ui-bg-transparent hover:ui-font-semibold"
      >
        {t('bmhpPlanning:detail_and_configure')}
      </Button>
    </Link>
  )
}

export default BmhpPlanningDetailButton
