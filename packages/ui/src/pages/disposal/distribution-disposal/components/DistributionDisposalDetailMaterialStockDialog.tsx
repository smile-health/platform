import React, { FC } from 'react'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

import { StockDetailColumns } from '../constants/table'
import { DetailDistributionDisposalItem } from '../types/DistributionDisposal'
import { materialStockReformer } from '../utils/util'
import DistributionDisposalDetailVerticalIdentity from './DistributionDisposalDetailVerticalIdentity'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type DistributionDisposalDetailMaterialStockDialogProps = {
  open: boolean
  handleClose: () => void
  data?: DetailDistributionDisposalItem
}

const DistributionDisposalDetailMaterialStockDialog: FC<
  DistributionDisposalDetailMaterialStockDialogProps
> = ({ open, handleClose, data = null }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const tableData = materialStockReformer(data?.disposal_shipment_stocks ?? [])
  const tableStyle = cx(tableData.length > 0 && 'ui-max-h-96 ui-overflow-auto')
  const nothingHasBatch = tableData?.every(
    (item) => !item?.batch?.code || item?.batch?.code === ''
  )

  return (
    <Dialog open={open} onOpenChange={handleClose} size="xl">
      <DialogCloseButton />
      <DialogHeader className="ui-my-2">
        <h3 className="ui-text-center ui-text-xl ui-font-medium">
          {t('distributionDisposal:detail.material.view_detail')}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-my-2 ui-py-2">
        <DistributionDisposalDetailVerticalIdentity
          title={t('common:form.material.label')}
          value={data?.master_material.name ?? '-'}
        />
        <DataTable
          className={tableStyle}
          data={tableData}
          columns={StockDetailColumns({ t, language, nothingHasBatch })}
        />
      </DialogContent>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogFooter>
        <Button
          color="primary"
          variant="outline"
          className="ui-w-full"
          onClick={handleClose}
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default DistributionDisposalDetailMaterialStockDialog
