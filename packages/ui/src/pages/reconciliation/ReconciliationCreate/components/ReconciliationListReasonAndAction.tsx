import React from 'react'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'

import { ReonciliationItems } from '../reconciliation-create.type'

export default function ReconciliationListReasonAndAction({
  item,
  setOpenModal,
}: {
  item: ReonciliationItems
  setOpenModal: (value: boolean) => void
}) {
  const { t } = useTranslation(['reconciliation', 'common'])
  return (
    <div className="ui-flex ui-flex-col ui-space-y-5">
      <div className="ui-flex ui-flex-col ui-space-y-3">
        {item?.reasons?.map((itemReason, indexReason) => (
          <div
            className="ui-flex ui-flex-col ui-space-y-1 ui-text-dark-blue"
            key={`${indexReason.toString()}`}
          >
            <div>
              {t('reconciliation:list.table.reason')}: {itemReason?.title ?? ''}
            </div>
            <div>
              {t('reconciliation:list.table.action')}:{' '}
              {item.actions?.[indexReason]?.title ?? ''}
            </div>
          </div>
        ))}
      </div>
      <div className="ui-text-left">
        <Button
          variant="subtle"
          color="primary"
          onClick={(e) => {
            e.preventDefault()
            setOpenModal(true)
          }}
        >
          {t('common:edit')}
        </Button>
      </div>
    </div>
  )
}
