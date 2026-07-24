import { DataTable } from '#components/data-table'
import { H5 } from '#components/heading'
import { ReactSelectAsync } from '#components/react-select'
import { Td, Tr } from '#components/table'
import cx from '#lib/cx'
import { loadListStockByEntities } from '#services/stock'
import { Stock } from '#types/stock'
import {
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useFormContext,
} from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import useEntityMaterialSelection from '../hooks/useEntityMaterialSelection'
import { tableFormColumns } from '../order-create-central-distribution.constant'
import { loadEntityMaterials } from '../order-create-central-distribution.service'
import {
  TDrawerQuantity,
  TOrderFormValues,
} from '../order-create-central-distribution.type'

type Props = {
  append: UseFieldArrayAppend<TOrderFormValues>
  remove: UseFieldArrayRemove
  setDrawerQuantity: (detail: TDrawerQuantity) => void
}

export default function OrderCreateCentralDistributionTableForm({
  append,
  remove,
  setDrawerQuantity,
}: Readonly<Props>) {
  const { t } = useTranslation('orderCentralDistribution')

  const {
    watch,
    formState: { errors },
  } = useFormContext<TOrderFormValues>()
  const { order_items, activity, vendor, customer } = watch()

  const selectedMaterial = order_items?.map((item) => item?.id) as number[]

  const { handleAddItem } = useEntityMaterialSelection({
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
            <Td colSpan={3}>
              <ReactSelectAsync
                key={selectedMaterial?.toString()}
                id="select-material-dropdown"
                value={null}
                className="ui-w-96"
                loadOptions={loadListStockByEntities}
                onChange={(option) => {
                  handleAddItem(option?.value as Stock)
                }}
                placeholder={t('form.material.add.placeholder')}
                additional={{
                  page: 1,
                  params: {
                    entity_id: vendor?.value,
                    activity_id: activity?.value,
                  },
                  selected_material_ids: selectedMaterial,
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
          onRemove: remove,
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
