import Link from 'next/link'
import { Button } from '#components/button'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

type Action = 'detail' | 'edit' | 'activation'
type ButtonActionTableProps = {
  path: string
  id?: string | number
  hidden?: Array<Action> | Array<string>
  isActive?: boolean
  onActivationClick?: VoidFunction
  isLoadingActivation?: boolean
}

export function ButtonActionTable({
  id,
  path,
  hidden,
  isActive,
  onActivationClick,
  isLoadingActivation,
}: Readonly<ButtonActionTableProps>) {
  const { t } = useTranslation(['common', 'entity'])
  const router = useSmileRouter()

  const isShow = (action: Action) => {
    return !hidden?.includes(action)
  }

  const getMainLink = () => {
    if (path?.includes('global')) {
      return router.getAsLinkGlobal(`/v5/${path}/${id}`)
    }
    return router.getAsLink(`/v5/${path}/${id}`)
  }

  return (
    <div className="ui-flex ui-gap-1">
      {isShow('detail') && (
        <Button
          asChild
          data-testid="btn-link-detail"
          size="sm"
          variant="subtle"
          className="ui-px-1.5"
        >
          <Link href={getMainLink()}>{t('common:detail')}</Link>
        </Button>
      )}
      {isShow('edit') && (
        <Button
          asChild
          data-testid="btn-link-edit"
          size="sm"
          variant="subtle"
          className="ui-px-1.5"
        >
          <Link href={`${getMainLink()}/edit`}>{t('common:edit')}</Link>
        </Button>
      )}
      {isShow('activation') && (
        <Button
          data-testid="btn-activation"
          size="sm"
          variant="subtle"
          color={isActive ? 'danger' : 'success'}
          disabled={isLoadingActivation}
          onClick={onActivationClick}
          className="ui-px-1.5"
        >
          {isActive
            ? t('common:status.deactivate')
            : t('common:status.activate')}
        </Button>
      )}
    </div>
  )
}
