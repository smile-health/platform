import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import AssetDetailContext from '../libs/asset-detail.context'
import { AssetLoggerRelationColumns } from './AssetDetailRelationToLoggerTableColumns'

const AssetDetailRelationToLoggerTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'asset'])
  const { childData } = useContext(AssetDetailContext)

  return (
    <div>
      <h2 className="ui-text-sm ui-font-bold">
        {t('asset:detail.asset_logger_relation')}
      </h2>
      <div className="ui-my-4">
        <DataTable
          columns={AssetLoggerRelationColumns(t, language)}
          data={childData ?? []}
        />
      </div>
    </div>
  )
}

export default AssetDetailRelationToLoggerTable
