import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

type AssetDetailButtonProps = {
  id: number
}

const AssetDetailButton: React.FC<AssetDetailButtonProps> = ({ id }) => {
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'asset'])
  return (
    <Link
      href={router.getAsLink(`/v5/asset/${id}`)}
      className="ui-p-0 ui-space-x-2 ui-block ui-my-2 ui-w-fit"
    >
      <Button
        type="button"
        variant="subtle"
        className="ui-w-fit ui-p-0 hover:!ui-bg-transparent hover:ui-font-semibold"
      >
        {t('common:detail')}
      </Button>
    </Link>
  )
}

export default AssetDetailButton
