import React, { FC, useContext } from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import { BOOLEAN } from '#constants/common'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { DetailDistributionDisposalItem } from '../types/DistributionDisposal'
import DistributionDisposalDetailMaterialContext from '../utils/distribution-disposal-detail-material.context'
import DistributionDisposalDetailContext from '../utils/distribution-disposal-detail.context'
import { thousandFormatter } from '../utils/util'
import DistributionDisposalDetailTitleBlock from './DistributionDisposalDetailTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type DistributionDisposalDetailMaterialReceiveButtonProps = {
  item: DetailDistributionDisposalItem
}
const DistributionDisposalDetailMaterialReceiveButton: FC<
  DistributionDisposalDetailMaterialReceiveButtonProps
> = ({ item }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const { savedQuantityData } = useContext(DistributionDisposalDetailContext)
  const { setQuantityData } = useContext(
    DistributionDisposalDetailMaterialContext
  )

  const foundSavedStock = savedQuantityData?.find(
    (data) => Number(data?.disposal_item_id) === Number(item?.id)
  )

  if (
    foundSavedStock?.stock_members?.some(
      (stock) => Number(stock?.received_qty) > 0
    )
  )
    return (
      <>
        {foundSavedStock?.stock_members
          ?.filter((itemStock) => Number(itemStock?.received_qty) > 0)
          ?.map((itemStock, index) => (
            <div key={index?.toString()} className="ui-mb-3">
              <DistributionDisposalDetailTitleBlock
                arrText={[
                  {
                    label: itemStock?.batch?.code
                      ? t(
                          'distributionDisposal:table.column.batch.batch_code',
                          {
                            value: itemStock?.batch?.code,
                          }
                        )
                      : null,
                    className: 'ui-text-dark-teal ui-font-normal ui-mb-1',
                  },
                  {
                    label: itemStock?.batch?.expired_date
                      ? t(
                          'distributionDisposal:table.column.batch.expired_date',
                          {
                            value: dayjs(itemStock?.batch?.expired_date)
                              .locale(language)
                              .format('DD MMMM YYYY')
                              .toUpperCase(),
                          }
                        )
                      : null,
                    className: 'ui-text-dark-teal ui-font-normal ui-mb-1',
                  },
                  {
                    label: itemStock?.activity?.name
                      ? t(
                          'distributionDisposal:table.column.batch.stock_from_activity',
                          {
                            value: itemStock?.activity?.name,
                          }
                        )
                      : null,
                    className: 'ui-text-dark-teal ui-font-normal ui-mb-1',
                  },
                  {
                    label: itemStock?.received_qty
                      ? t('distributionDisposal:table.column.batch.qty', {
                          value: thousandFormatter({
                            value: itemStock?.received_qty,
                            locale: language,
                          }),
                        })
                      : null,
                    className: 'ui-text-dark-teal ui-font-bold',
                  },
                ]}
              />
            </div>
          ))}
        <Button
          variant="outline"
          onClick={() => {
            setQuantityData(item)
          }}
        >
          {item?.master_material?.managed_in_batch === BOOLEAN.TRUE
            ? `${t('common:update')} ${t('distributionDisposal:detail.action.batch_quantity')}`
            : `${t('common:update')} ${t('distributionDisposal:detail.action.quantity')}`}
        </Button>
      </>
    )

  return (
    <Button
      variant="outline"
      type="button"
      leftIcon={<Plus className="ui-text-primary-500" />}
      disabled={Number(item?.shipped_qty) <= 0}
      onClick={() => {
        setQuantityData(item)
      }}
    >
      {item?.master_material?.managed_in_batch === BOOLEAN.TRUE
        ? t('distributionDisposal:detail.action.batch_quantity')
        : t('distributionDisposal:detail.action.quantity')}
    </Button>
  )
}

export default DistributionDisposalDetailMaterialReceiveButton
