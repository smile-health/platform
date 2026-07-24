import { PropsWithChildren } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { H3 } from '#components/heading'
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { generateMetaTitle } from '#utils/strings'
import { useTranslation } from 'react-i18next'

type ReconciliationContainerProps = PropsWithChildren & {
  hideTabs?: boolean
  metaTitle: string
}

export default function ReconciliationContainer({
  children,
  metaTitle,
}: ReconciliationContainerProps) {
  const { t } = useTranslation('reconciliation')
  const router = useSmileRouter()

  return (
    <Container title={t('title.reconciliation')} withLayout>
      <Meta title={generateMetaTitle(metaTitle)} />
      <div className="ui-space-y-6">
        <div className="ui-flex ui-justify-between ui-gap-4">
          <H3>{metaTitle}</H3>
          {hasPermission('reconciliation-mutate') && (
            <Link href={router.getAsLink('v5/reconciliation/create')}>
              <Button variant="solid">
                <div className="ui-flex ui-flex-row ui-space-x-2">
                  <span>
                    <Plus></Plus>
                  </span>
                  <div className="ui-text-sm">
                    {t('list.table.add_reconciliation')}
                  </div>
                </div>
              </Button>
            </Link>
          )}
        </div>
        {children}
      </div>
    </Container>
  )
}
