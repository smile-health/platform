import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

const AssetInventoryDetailEditButton = () => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const router = useSmileRouter()
  const { id } = router.query
  return (
    <Link
      href={router.getAsLinkGlobal(
        `/v5/global-asset/management/operational-asset-inventory/${id}/edit?fromPage=detail`
      )}
      className="ui-block ui-mb-4"
    >
      <Button variant="outline" className="hover:!ui-bg-blue-100">
        {t('common:edit')}
      </Button>
    </Link>
  )
}

export default AssetInventoryDetailEditButton
