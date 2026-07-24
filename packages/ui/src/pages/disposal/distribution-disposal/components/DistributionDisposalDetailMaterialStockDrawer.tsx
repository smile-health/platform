import { useContext, useEffect, useState } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import { useTranslation } from 'react-i18next'

import { v2DetailDistributionDisposalReceiveDetailFormSchema } from '../schemas/distribution-disposal.schema-form'
import { TUpdateReceivedStock } from '../types/DistributionDisposal'
import DistributionDisposalDetailMaterialContext from '../utils/distribution-disposal-detail-material.context'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'
import { materialStockReformer, thousandFormatter } from '../utils/util'
import DistributionDisposalDetailMaterialStockDrawerTable from './DistributionDisposalDetailMaterialStockDrawerTable'
import DistributionDisposalDetailVerticalIdentity from './DistributionDisposalDetailVerticalIdentity'

const DistributionDisposalDetailMaterialStockDrawer = () => {
  const [isOpened, setIsOpened] = useState(false)
  const [tempStorageQuantityData, setTempStorageQuantityData] = useState<
    TUpdateReceivedStock[] | null
  >(null)

  const { setSavedQuantityData, savedQuantityData } = useContext(
    DistributionDisposalDetailContext
  )
  const { quantityData, setQuantityData, setErrorForms } = useContext(
    DistributionDisposalDetailMaterialContext
  )
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const findSavedQuantityData = tempStorageQuantityData?.find(
    (item) => Number(item?.disposal_item_id) === Number(quantityData?.id)
  )

  const reformedStockData = materialStockReformer(
    quantityData?.disposal_shipment_stocks ?? []
  )

  const schema = v2DetailDistributionDisposalReceiveDetailFormSchema(
    t,
    language
  )

  useEffect(() => {
    if (quantityData) {
      setIsOpened(true)
      if (savedQuantityData) {
        setTempStorageQuantityData(savedQuantityData)
      } else {
        setTempStorageQuantityData([])
      }
    }
  }, [quantityData])

  const handleClose = () => {
    setIsOpened(false)
    setTimeout(() => {
      setQuantityData(null)
      setTempStorageQuantityData(null)
      setErrorForms({})
    }, 300)
  }

  const ensureAllFieldsAreFilled = () => {
    const qcPassed: number[] = []
    const filledData = findSavedQuantityData?.stock_members ?? reformedStockData
    filledData?.forEach((item, index) => {
      const fieldPath = `stock_members[${index}].received_qty`
      if (!item.received_qty) {
        setErrorForms((prev: any) => ({
          ...prev,
          [fieldPath]: t('common:validation.required'),
        }))
        if (qcPassed?.includes(index)) {
          qcPassed.splice(qcPassed.indexOf(index), 1)
        }
      } else {
        setErrorForms((prev: any) => ({
          ...prev,
          [fieldPath]: null,
        }))
        qcPassed.push(index)
      }
    })
    return qcPassed.length === filledData?.length
  }

  const handleSave = async () => {
    if (!ensureAllFieldsAreFilled()) return
    try {
      await schema.validate(findSavedQuantityData, {
        abortEarly: false,
        strict: true,
      })
      setSavedQuantityData(tempStorageQuantityData)
      handleClose()
    } catch (error: any) {
      const errors: { [key: string]: string } = {}
      error.inner.forEach((err: any) => {
        errors[err.path] = err.message
      })
      setErrorForms(errors)
    }
  }

  const handleReset = () => {
    setErrorForms({})
    const resettedStockData = tempStorageQuantityData?.find(
      (item) => Number(item?.disposal_item_id) === Number(quantityData?.id)
    )
    if (resettedStockData) {
      setTempStorageQuantityData(
        tempStorageQuantityData?.map((item) =>
          Number(item?.disposal_item_id) === Number(quantityData?.id)
            ? {
                ...item,
                stock_members: item?.stock_members?.map((stock) => ({
                  ...stock,
                  received_qty: null,
                })),
              }
            : item
        ) as TUpdateReceivedStock[]
      )
    }
  }

  return (
    <Drawer open={isOpened} placement="bottom" sizeHeight="lg" size="full">
      <DrawerHeader className="ui-border-b-zinc-300">
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {quantityData?.master_material?.managed_in_batch
              ? t('distributionDisposal:detail.action.batch_quantity')
              : t('distributionDisposal:detail.action.quantity')}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={() => {
              handleClose()
            }}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        <div className="ui-grid ui-grid-cols-[40%_40%_20%] ui-gap-4 ui-mb-1">
          <DistributionDisposalDetailVerticalIdentity
            title={t('common:form.material.label')}
            value={quantityData?.master_material?.name ?? '-'}
          />
          <DistributionDisposalDetailVerticalIdentity
            title={t('distributionDisposal:table.column.shipped')}
            value={
              quantityData?.shipped_qty
                ? thousandFormatter({
                    value: Number(quantityData.shipped_qty),
                    locale: language,
                  })
                : '-'
            }
          />
        </div>
        <div
          className="ui-py-2"
          id="distribution-disposal-detail-material-stock"
        >
          <DistributionDisposalDetailMaterialStockDrawerTable
            setTempStorageQuantityData={setTempStorageQuantityData}
            tempStorageQuantityData={tempStorageQuantityData}
          />
        </div>
      </DrawerContent>
      <DrawerFooter>
        <Button
          variant="subtle"
          type="button"
          onClick={handleReset}
          className="ui-px-4"
          leftIcon={<Reload className="ui-w-5 ui-h-5 ui-mr-2" />}
        >
          {t('common:reset')}
        </Button>
        <Button
          variant="solid"
          type="button"
          onClick={handleSave}
          className="ui-px-16"
        >
          {t('common:save')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default DistributionDisposalDetailMaterialStockDrawer
