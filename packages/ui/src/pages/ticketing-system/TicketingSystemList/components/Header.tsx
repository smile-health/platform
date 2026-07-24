'use client'

import { Button } from '#components/button'
import { H3 } from '#components/heading'
import Plus from '#components/icons/Plus'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

export default function TicketingSystemListHeader(): JSX.Element {
  const router = useSmileRouter()
  const { t } = useTranslation('ticketingSystemList')

  const navigateToCreate = () => {
    if (hasPermission('ticketing-system-create')) {
      router.push('/v5/ticketing-system/create')
    } else {
      router.push('/v5/ticketing-system')
    }
  }

  return (
    <div className="ui-flex ui-justify-between ui-gap-4 ui-items-center">
      <H3>{t('table.title')}</H3>
      {hasPermission('ticketing-system-create') && (
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
