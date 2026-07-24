import React, { useContext } from 'react'
import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import { BOOLEAN } from '#constants/common'
import { hasPermission } from '#shared/permission/index'
import { useTranslation } from 'react-i18next'

import EntityDetailToEditContext from '../utils/entity-detail-to-edit-context'

const EntityDetailActivityImplementationTimeEmptyData = () => {
  const { t } = useTranslation(['entity', 'common'])
  const { setIsEdit, entity } = useContext(EntityDetailToEditContext)

  return (
    <div className="ui-w-full ui-flex ui-justify-center ui-items-center ui-flex-col ui-py-[40px] ui-mb-[40px] ui-mt-[16px]">
      <div className="ui-h-auto ui-w-[352px] ui-flex ui-flex-col ui-items-center ui-justify-center">
        <EmptyState
          title={t('common:message.empty.title')}
          description={t('entity:message.data_currently_empty')}
          withIcon
        />
      </div>
      <div className="ui-h-auto ui-w-auto ui-flex ui-justify-center ui-items-center">
        {hasPermission('entity-mutate') && (
          <Button
            id="btn-link-entity-edit"
            variant="solid"
            onClick={() => setIsEdit(true)}
            disabled={entity?.status === BOOLEAN.FALSE}
            className="ui-w-auto ui-px-[79.5px]"
          >
            {t('entity:form.time.setup_data')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default EntityDetailActivityImplementationTimeEmptyData
