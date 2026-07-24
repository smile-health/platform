import { useState } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import { Exists } from '#components/exists'
import ActiveLabel from '#components/modules/ActiveLabel'
import { ModalConfirmation } from '#components/modules/ModalConfirmation'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import useSmileRouter from '#hooks/useSmileRouter'
import { isViewOnly } from '#utils/user'
import { useTranslation } from 'react-i18next'

import { BudgetSourceDetailInfoProps } from '../budget-source.type'
import { generateDetail } from '../utils/helper'
import BudgetSourceSkeleton from './BudgetSourceSkeleton'

export default function BudgetSourceDetailInfo(
  props: BudgetSourceDetailInfoProps
) {
  const { isLoading, data, isGlobal, onUpdateStatus, isLoadingUpdateStatus } =
    props
  const { t } = useTranslation(['budgetSource', 'common'])
  const { getAsLink, getAsLinkGlobal } = useSmileRouter()
  const [updateItem, setUpdateItem] = useState<boolean>(false)

  if (isLoading) {
    return <BudgetSourceSkeleton />
  }

  const detail = generateDetail(t, data)
  const getEditUrl = () => {
    if (isGlobal) {
      return getAsLinkGlobal(
        `/v5/global-settings/budget-source/${data?.id}/edit`,
        null,
        {
          fromPage: 'detail',
        }
      )
    }

    return getAsLink('/v5/budget-source/${data?.id}/edit', null, {
      fromPage: 'detail',
    })
  }

  const status = data?.status
  return (
    <div className="ui-p-4 ui-mt-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-4">
      <ModalConfirmation
        open={updateItem}
        setOpen={setUpdateItem}
        description={
          status
            ? t('budgetSource:action.deactivate.confirmation')
            : t('budgetSource:action.activate.confirmation')
        }
        onSubmit={() =>
          onUpdateStatus({ id: String(data?.id), status: data?.status ? 0 : 1 })
        }
      />
      <div className="ui-flex ui-justify-between ui-items-start ui-gap-4">
        <h5 className="ui-font-bold">Details</h5>
        <Exists useIt={!isViewOnly()}>
          <div className="ui-grid ui-grid-cols-1 ui-w-[150px] ui-justify-end">
            <Exists useIt={isGlobal ?? false}>
              <Button
                asChild
                id="btn-link-budget-source-edit"
                variant="outline"
                onClick={() => {}}
              >
                <Link href={getEditUrl()}>{t('common:edit')}</Link>
              </Button>
            </Exists>
            <Exists useIt={!isGlobal}>
              <Button
                data-testid="btn-manufacturer-activation"
                loading={isLoadingUpdateStatus}
                disabled={isLoadingUpdateStatus}
                variant="outline"
                color={status ? 'danger' : 'success'}
                onClick={() => setUpdateItem(true)}
              >
                {status
                  ? t('common:status.deactivate')
                  : t('common:status.activate')}
              </Button>
            </Exists>
          </div>
        </Exists>
      </div>
      {!isGlobal && <ActiveLabel isActive={Boolean(data?.status)} />}
      <RenderDetailValue data={detail} />
    </div>
  )
}
