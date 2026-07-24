'use client'

import { Button } from '#components/button'
import { H3 } from '#components/heading'
import Plus from '#components/icons/Plus'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

export const DisposalInstructionListHeader = () => {
  const router = useSmileRouter()
  const { t } = useTranslation('disposalInstructionList')

  const navigateToCreate = () => {
    router.push('/v5/disposal-instruction/create')
  }

  return (
    <div className="ui-flex ui-justify-between ui-gap-4 ui-items-center">
      <H3>{t('table.title')}</H3>

      {hasPermission('disposal-instruction-mutate') && !isViewOnly() && (
        <Button
          leftIcon={<Plus className="ui-size-5" />}
          onClick={navigateToCreate}
          className="ui-min-w-40"
        >
          {t('button.create')}
        </Button>
      )}
    </div>
  )
}
