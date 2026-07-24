'use client'

import { Button } from '#components/button'
import { H3 } from '#components/heading'
import Plus from '#components/icons/Plus'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

export default function AnnualCommitmentListHeader(): JSX.Element {
  const router = useSmileRouter()
  const { t } = useTranslation('annualCommitmentList')

  const navigateToCreate = () => {
    router.push('/v5/annual-commitment/create')
  }

  return (
    <div className="ui-flex ui-justify-between ui-gap-4 ui-items-center">
      <H3>{t('table.title')}</H3>
      {hasPermission('annual-commitment-mutate') && (
        <Button
          leftIcon={<Plus className="ui-size-5" />}
          onClick={navigateToCreate}
        >
          {t('button.create')}
        </Button>
      )}
    </div>
  )
}
