import { DataTable } from '#components/data-table'
import { H5 } from '#components/heading'
import { ReactSelectAsync } from '#components/react-select'
import { Td, Tr } from '#components/table'
import cx from '#lib/cx'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { loadMaterial } from '../../order.service'
import useMaterialStockDetails from '../hooks/useMaterialStockDetails'
import { tableFormColumns } from '../order-create-distribution.constant'
import {
  TDrawerQuantity,
  TOrderFormValues,
} from '../order-create-distribution.type'

type Props = {
  append: UseFieldArrayAppend<TOrderFormValues>
  remove: UseFieldArrayRemove
  setDrawerQuantity: (detail: TDrawerQuantity) => void
}

export default function OrderCreateDistributionTableForm({
  append,
  remove,
  setDrawerQuantity,
}: Readonly<Props>) {
  const {
    t,
    i18n: { language },
  } = useTranslation('orderDistribution')

  const {
    watch,
    formState: { errors },
  } = useFormContext<TOrderFormValues>()
  const { order_items, activity, vendor } = watch()

  const selectedMaterial = order_items?.map(
    (item) => item?.material?.id
  ) as number[]

  function formatNumber(value: number) {
    return numberFormatter(value, language)
  }

  const { handleAddItem, handleRemoveItem } = useMaterialStockDetails({
    append,
    remove,
  })

  return (
    <div className="ui-p-6 ui-border ui-border-neutral-300 ui-rounded ui-space-y-6 ui-col-span-2">
      <H5>{t('section.distribution_table')}</H5>

      <DataTable
        withCustomRow={Boolean(order_items?.length)}
        data={order_items}
        bodyClassName={cx({ 'ui-h-60': !order_items?.length })}
        emptyDescription={t('info.empty.description.material')}
        customRow={
          <Tr className="ui-border-t ui-border-gray-300">
            <Td colSpan={2}>
              <ReactSelectAsync
                key={selectedMaterial?.toString()}
                id="select-material-dropdown"
                value={null}
                loadOptions={loadMaterial}
                onChange={(option) => {
                  handleAddItem(option?.value as Stock)
                }}
                isOptionDisabled={(option: {
                  label: string | undefined
                  value: Stock
                  isDisabled: boolean
                }) => {
                  return option?.isDisabled
                }}
                placeholder={t('form.material.add.placeholder')}
                additional={{
                  page: 1,
                  entity_id: vendor?.value,
                  activity_id: activity?.value,
                  material_ids: selectedMaterial,
                }}
                menuPortalTarget={document.documentElement}
                menuPlacement="auto"
                menuPosition="fixed"
              />
            </Td>
          </Tr>
        }
        columns={tableFormColumns({
          t,
          activity,
          formatNumber,
          onRemove: handleRemoveItem,
          errors,
          onClickBatch: (data, index) => {
            setDrawerQuantity({
              open: true,
              data,
              index,
            })
          },
        })}
      />
    </div>
  )
}
