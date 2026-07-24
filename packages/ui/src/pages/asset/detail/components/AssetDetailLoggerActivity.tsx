import React, { useContext, useEffect, useMemo, useState } from 'react'
import { OptionType } from '#components/react-select'

import AssetDetailLoggerActivityContext from '../libs/asset-detail-logger-activity.context'
import AssetDetailContext from '../libs/asset-detail.context'
import { TFilterLoggerActivity } from '../libs/asset-detail.types'
import AssetDetailLoggerActivityFilter from './AssetDetailLoggerActivityFilter'
import AssetDetailLoggerActivityTable from './AssetDetailLoggerActivityTable'

const AssetDetailLoggerActivity = () => {
  const { childData } = useContext(AssetDetailContext)
  const [shouldFetch, setShouldFetch] = useState<boolean>(false)
  const [filter, setFilter] = useState<TFilterLoggerActivity | null>({
    asset: null,
    date_range: {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    },
  })
  const loggerOptions =
    childData?.map((item) => {
      const assetModelName = item?.asset_model
        ? ` - ${item?.asset_model?.name}`
        : ''
      return {
        label: `${item?.serial_number} ${assetModelName}`,
        value: item?.id,
      }
    }) ?? []

  useEffect(() => {
    if (loggerOptions.length > 0) {
      const newFilter = {
        ...filter,
        asset: loggerOptions[0] as OptionType,
      }
      setFilter(newFilter as TFilterLoggerActivity)
    }
  }, [childData])

  const contextValue = useMemo(
    () => ({
      filter,
      setFilter,
      shouldFetch,
      setShouldFetch,
    }),
    [filter, setFilter, shouldFetch, setShouldFetch]
  )

  return (
    <AssetDetailLoggerActivityContext.Provider value={contextValue}>
      <AssetDetailLoggerActivityFilter loggerOptions={loggerOptions} />
      <div className="ui-mt-4">
        <AssetDetailLoggerActivityTable />
      </div>
    </AssetDetailLoggerActivityContext.Provider>
  )
}

export default AssetDetailLoggerActivity
