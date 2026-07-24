import React, { useContext, useMemo, useState } from 'react'
import { DataTable } from '#components/data-table'
import { useTranslation } from 'react-i18next'

import { MaterialItemColumns } from '../constants/table'
import { DetailDistributionDisposalItem } from '../types/DistributionDisposal'
import DistributionDisposalDetailMaterialContext from '../utils/distribution-disposal-detail-material.context'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'
import DistributionDisposalDetailMaterialStockDialog from './DistributionDisposalDetailMaterialStockDialog'
import DistributionDisposalDetailMaterialStockDrawer from './DistributionDisposalDetailMaterialStockDrawer'

const DistributionDisposalDetailMaterial = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])
  const { data } = useContext(DistributionDisposalDetailContext)
  const [selected, setSelected] = useState<{
    open: boolean
    data?: DetailDistributionDisposalItem
  }>({ open: false, data: undefined })

  const [quantityData, setQuantityData] =
    useState<DetailDistributionDisposalItem | null>(null)
  const [errorForms, setErrorForms] = useState<{
    [key: string]: string | null
  }>({})

  const contextValue = useMemo(
    () => ({
      quantityData,
      setQuantityData,
      errorForms,
      setErrorForms,
    }),
    [quantityData, setQuantityData, errorForms, setErrorForms]
  )

  return (
    <DistributionDisposalDetailMaterialContext.Provider value={contextValue}>
      <DistributionDisposalDetailMaterialStockDialog
        open={selected.open}
        handleClose={() => setSelected({ open: false, data: undefined })}
        data={selected.data}
      />
      <DistributionDisposalDetailMaterialStockDrawer />
      <div className="ui-border ui-rounded ui-p-6 ui-space-y-3 ui-border-neutral-300">
        <p className="ui-text-dark-teal ui-font-semibold">
          Item{' '}
          {data?.disposal_items && data?.disposal_items?.length > 0
            ? `(${data?.disposal_items?.length})`
            : ''}
        </p>
        <DataTable
          data={data?.disposal_items ?? []}
          columns={MaterialItemColumns({
            t,
            locale: language,
            setSelected: (value) => {
              setSelected(value)
            },
          })}
        />
      </div>
    </DistributionDisposalDetailMaterialContext.Provider>
  )
}

export default DistributionDisposalDetailMaterial
