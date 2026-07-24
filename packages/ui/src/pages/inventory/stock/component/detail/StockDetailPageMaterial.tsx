import { Fragment } from 'react'
import { DataTable } from '#components/data-table'
import { RenderDetailValue } from '#components/modules/RenderDetailValue'
import { BOOLEAN } from '#constants/common'
import { Stock } from '#types/stock'
import { numberFormatter } from '#utils/formatter'
import { getProgramStorage } from '#utils/storage/program'
import { useTranslation } from 'react-i18next'

import { DETAIL_STOCK_INDEX } from '../../constant/stock-detail.constant'
import { columnsDetail } from '../../constant/table'
import { useStockDetailPageModalTableDetail } from '../../hooks/useStockDetailPageModalTableDetail'
import StockModalTableDetail from '../StockModalTableDetail'

type Props = {
  data?: Stock
}

const StockDetailPageMaterial: React.FC<Props> = (props) => {
  const { data } = props
  const isHierarchical =
    getProgramStorage()?.config?.material?.is_hierarchy_enabled
  const {
    t,
    i18n: { language },
  } = useTranslation('stock')
  const { modalDetail, handleOpen, handleClose } =
    useStockDetailPageModalTableDetail()
  const isOpenVial = data?.details?.some(
    (item) => Number(item.material?.is_open_vial) === BOOLEAN.TRUE
  )

  return (
    <Fragment>
      <StockModalTableDetail
        dataParent={data}
        data={modalDetail.data}
        open={modalDetail.open}
        isHierarchical={isHierarchical}
        handleClose={handleClose}
      />

      <div className="ui-p-6 ui-border ui-rounded ui-space-y-4 ui-mx-3">
        <div className="ui-flex ui-justify-between ui-items-start">
          <div className="ui-font-semibold">Material</div>
        </div>

        <RenderDetailValue
          className="ui-gap-y-2"
          valuesClassName="ui-text-neutral-500 ui-text-base ui-font-bold"
          data={[
            {
              label: t('detail.material.name', { returnObjects: true })[
                isHierarchical
                  ? DETAIL_STOCK_INDEX.API_FIRST_INDEX
                  : DETAIL_STOCK_INDEX.API_SECOND_INDEX
              ],
              value: data?.material?.name || '-',
            },
            {
              label: t('detail.material.stock.on_hand'),
              value: numberFormatter(data?.total_qty || 0, language),
            },
            {
              label: t('detail.material.stock.allocated'),
              value: numberFormatter(data?.total_allocated_qty || 0, language),
            },
            {
              label: t('detail.material.stock.available'),
              value: !isOpenVial
                ? numberFormatter(data?.total_available_qty || 0, language)
                : `${
                    t('table.column.material.vial', {
                      returnObjects: true,
                      value: numberFormatter(
                        data?.total_available_qty || 0,
                        language
                      ),
                    })[3]
                  } - ${
                    t('table.column.material.vial', {
                      returnObjects: true,
                      value: numberFormatter(
                        data?.total_open_vial_qty || 0,
                        language
                      ),
                    })[2]
                  }`,
            },
            {
              label: t('detail.material.stock.in_transit'),
              value: numberFormatter(data?.total_in_transit_qty || 0, language),
            },
            { label: 'Min', value: numberFormatter(data?.min || 0, language) },
            { label: 'Max', value: numberFormatter(data?.max || 0, language) },
          ]}
        />

        <div className="ui-flex ui-justify-between ui-items-start">
          <div className="ui-font-semibold">
            {isHierarchical
              ? t('table.title.trademark')
              : t('table.title.activity')}
          </div>
        </div>

        <DataTable
          data={data?.details || []}
          columns={columnsDetail({
            onClickRow: handleOpen,
            t,
            isHierarchical,
            language,
          })}
          className="ui-overflow-x-auto"
          bodyClassName="ui-bg-white"
        />
      </div>
    </Fragment>
  )
}

export default StockDetailPageMaterial
