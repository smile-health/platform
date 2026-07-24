import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

type AssetInventoryDetailButtonProps = {
  id: number
}

const AssetInventoryDetailButton: React.FC<AssetInventoryDetailButtonProps> = ({
  id,
}) => {
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'assetInventory'])
  return (
    <Link
      href={router.getAsLinkGlobal(
        `/v5/global-asset/management/operational-asset-inventory/${id}?fromPage=list`
      )}
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

export default AssetInventoryDetailButton
