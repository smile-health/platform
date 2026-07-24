import React from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import Meta from '#components/layouts/Meta'
import Container from '#components/layouts/PageContainer'
import { usePermission } from '#hooks/usePermission'
import useSmileRouter from '#hooks/useSmileRouter'
import { useTranslation } from 'react-i18next'

import {
  MasterListFilter,
  MasterListFilterProps,
} from './components/MasterListFilter'
import {
  MasterListTable,
  MasterListTableProps,
} from './components/MasterListTable'

export interface MasterListPageProps<T>
  extends MasterListTableProps<T>, MasterListFilterProps {
  title: string
  sectionTitle?: string
  basePath?: string
  withLayout?: boolean
  noAddButton?: boolean
  customAddButton?: React.ReactNode
  permission?: Parameters<typeof usePermission>[0]
}

const MasterListPage: React.FC<MasterListPageProps<any>> = (props) => {
  usePermission(props.permission ?? 'master-bmhp-view')
  const { t } = useTranslation(['common'])
  const router = useSmileRouter()
  const { withLayout = true } = props

  const content = (
    <div className="ui-space-y-6">
      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">
          {props.sectionTitle ?? props.title}
        </h5>
        {!props.noAddButton &&
          (props.customAddButton || (
            <Link
              href={router.getAsLink(`${props.basePath}/create`)}
              className="ui-block"
              id="create-bmhp-master-link"
              data-testid="create-bmhp-master-link"
            >
              <Button
                id="create-bmhp-master"
                data-testid="create-bmhp-master"
                type="button"
                className="ui-min-w-40"
                leftIcon={<Plus className="ui-size-5" />}
              >
                {t('add')}
              </Button>
            </Link>
          ))}
        {/* )} */}
      </div>
      <MasterListFilter {...props} />
      <MasterListTable {...props} />
    </div>
  )

  if (!withLayout) {
    return content
  }

  return (
    <Container title={props.title} withLayout>
      <Meta title={props.title} />
      {content}
    </Container>
  )
}

export default MasterListPage
