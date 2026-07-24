import React, { useContext } from 'react'
import Link from 'next/link'
import { Button } from '#components/button'
import Pencil from '#components/icons/Pencil'
import useSmileRouter from '#hooks/useSmileRouter'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import PeriodOfStockTakingListContext from '../libs/period-of-stock-taking-list.context'

const PeriodOfStockTakingActivePeriodBox = () => {
  const { t } = useTranslation(['common', 'periodOfStockTaking'])
  const router = useSmileRouter()

  const { activeStockTakingData } = useContext(PeriodOfStockTakingListContext)

  return (
    <div className="ui-p-4 ui-border ui-border-gray-300 ui-rounded ui-bg-stone-100 ui-flex ui-justify-between ui-items-center">
      <div className="ui-flex ui-flex-col ui-gap-2">
        <h3 className="ui-text-sm ui-font-bold ui-text-neutral-500">
          {t('periodOfStockTaking:active_period')}
        </h3>
        <div>
          <p className="ui-text-sm ui-font-bold ui-text-dark-teal">
            {activeStockTakingData?.name ?? ''}
            &nbsp;
            <span className="ui-text-sm ui-font-normal ui-text-neutral-500">
              ({t('periodOfStockTaking:only_active_period')})
            </span>
          </p>
        </div>
      </div>
      {hasPermission('period-of-stock-taking-mutate') && (
        <Link
          href={router.getAsLink(`/v5/period-of-stock-taking/edit`)}
          className="ui-block"
        >
          <Button
            variant="subtle"
            type="button"
            leftIcon={<Pencil className="ui-size-5" />}
            className="hover:!ui-bg-transparent hover:ui-scale-110 ui-transition-all ui-duration-200 ui-will-change-transform ui-select-none ui-whitespace-nowrap"
          >
            {t('common:edit')}
          </Button>
        </Link>
      )}
    </div>
  )
}

export default PeriodOfStockTakingActivePeriodBox
