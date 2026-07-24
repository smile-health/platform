import React, { useContext } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import AssetDetailContext from '../libs/asset-detail.context'
import { TemperatureColumns } from './AssetDetailTemperatureTableColumns'

const AssetDetailTemperatureTable = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'asset'])
  const { childData } = useContext(AssetDetailContext)

  return (
    <div>
      <h2 className="ui-text-sm ui-font-normal">
        {t('asset:detail.asset_temperature')}
      </h2>
      <div className="ui-my-4">
        <DataTable
          columns={TemperatureColumns(t, language)}
          data={childData ?? []}
        />
      </div>
    </div>
  )
}

export default AssetDetailTemperatureTable
