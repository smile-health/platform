import { hasPermission } from '#shared/permission/index'
import { RequestloginResponse } from '#types/auth'
import { TSingleOptions } from '#types/common'
import { isObject } from '#utils/object'

import {
  DistributionDisposalOrderItemForm,
  DistributionDisposalOrderItemsPayload,
  DistributionDisposalStockExterminationForm,
  DistributionDisposalStockExterminationsPayload,
  DistributionDisposalStockForm,
  DistributionDisposalStocksPayload,
  ListDistributionDisposalParams,
  TDistributionDisposalShipmentDetailStock,
  TDistributionDisposalShipmentDetailStockReformed,
  TSubmitUpdateReceivedStock,
} from '../types/DistributionDisposal'

export const setStockExterminationsPayload = (
  stockEx: DistributionDisposalStockExterminationForm[]
) => {
  const result: DistributionDisposalStockExterminationsPayload[] = []
  let total = 0

  stockEx.forEach((x) => {
    total += (x.discard_qty ?? 0) + (x.received_qty ?? 0)
    result.push({
      discard_qty: x.discard_qty ?? 0,
      received_qty: x.received_qty ?? 0,
      disposal_stock_id: x.stock_extermination_id,
      transaction_reasons: {
        id: x?.transaction_reason_id,
      },
    })
  })

  return {
    total,
    stock: result,
  }
}

export const setStockPayload = (stock: DistributionDisposalStockForm[]) => {
  const result: DistributionDisposalStocksPayload[] = []
  let total = 0

  stock.forEach((x) => {
    const stockEx = setStockExterminationsPayload(x.stock_exterminations)
    if (stockEx.total) {
      total += stockEx.total

      result.push({
        activity_id: x.activity_id,
        activity_name: x.activity_name,
        batch: x.batch
          ? {
              code: x.batch.code,
              id: x.batch.id,
            }
          : null,
        stock_id: x.stock_id,
        stock_qty: stockEx.total,
        disposal_stocks: stockEx.stock,
      })
    }
  })

  return {
    total,
    stock: result,
  }
}

export const setOrderItemsPayload = (
  items: DistributionDisposalOrderItemForm[]
) => {
  const result: DistributionDisposalOrderItemsPayload[] = []

  items.forEach((x) => {
    const stock = setStockPayload(
      (x?.stocks ?? []).map((stock) => ({
        ...stock,
        stock_exterminations: stock.stock_exterminations ?? [],
      }))
    )

    result.push({
      material_id: x.material_id,
      material_name: x.material_name,
      shipment_qty: stock.total,
      stocks: stock.stock,
    })
  })

  return result
}

export const filterOfUser = (user: RequestloginResponse) => {
  const userEntity = user?.entity
  const hasGlobalPermission = hasPermission(
    'disposal-distribution-enable-select-entity'
  )

  const defaultProvince = userEntity?.province
    ? {
        value: userEntity.province.id,
        label: userEntity.province.name,
      }
    : null

  const defaultRegency = userEntity?.regency
    ? {
        value: userEntity.regency.id,
        label: userEntity.regency.name,
      }
    : null

  return {
    defaultProvince: !hasGlobalPermission ? defaultProvince : null,
    defaultRegency: !hasGlobalPermission ? defaultRegency : null,
  }
}

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListDistributionDisposalParams
    | Omit<ListDistributionDisposalParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.fromEntries(
    Object.entries(params).flatMap(([key, value]): [string, any][] => {
      if (isExport && ['paginate', 'page'].includes(key)) {
        return [] // skip
      }

      if (key === 'date_range') {
        const { start, end } = (value as { start: string; end: string }) || {}
        return [
          ['from_date', start],
          ['to_date', end],
        ]
      }

      if (key === 'primary_vendor_id') {
        return [['entity_id', (value as unknown as TSingleOptions)?.value]]
      }

      if (isObject(value)) {
        return [[key, (value as unknown as TSingleOptions)?.value]]
      }

      return [[key, value]]
    })
  )

export const thousandFormatter = ({
  value,
  locale = 'en-US',
}: {
  value: number
  locale: string
}) => {
  return new Intl.NumberFormat(locale).format(value) || ''
}

export const materialStockReformer = (
  data: TDistributionDisposalShipmentDetailStock[]
) => {
  return data?.reduce(
    (acc: TDistributionDisposalShipmentDetailStockReformed[], item) => {
      const batchCode = item.stock?.batch?.code ?? null
      const reason_id = item?.transaction_reasons?.id
      const reason = item.transaction_reasons?.title

      if (!reason || !reason_id) return acc

      let group = acc.find((g) => {
        const existingCode = g?.batch?.code ?? null
        return existingCode === batchCode
      })

      if (!group) {
        group = {
          id: item.id,
          batch: item?.stock?.batch,
          activity: item?.stock?.activity,
          accumulated_reasons: [],
          disposal_discard_reasons: [],
          disposal_received_reasons: [],
          received_qty: item?.received_qty ?? null,
        }
        acc.push(group)
      }

      const updateReasonArray = (
        arr: { reason_id: number; reason: string; qty: number }[],
        reason_id: number,
        reason: string,
        qty: number
      ) => {
        if (qty == null) return
        const found = arr.find((r) => Number(r.reason_id) === Number(reason_id))
        if (found) {
          found.qty += qty
        } else {
          arr.push({ reason_id, reason, qty })
        }
      }

      const discardQty = item.disposal_discard_qty ?? 0
      const receivedQty = item.disposal_received_qty ?? 0
      const total = discardQty + receivedQty

      updateReasonArray(group.accumulated_reasons, reason_id, reason, total)
      updateReasonArray(
        group.disposal_discard_reasons,
        reason_id,
        reason,
        discardQty
      )
      updateReasonArray(
        group.disposal_received_reasons,
        reason_id,
        reason,
        receivedQty
      )

      return acc
    },
    [] as TDistributionDisposalShipmentDetailStockReformed[]
  )
}

export const processReceivedData = (data: TSubmitUpdateReceivedStock) => {
  const result = {
    comment: data?.comment ?? '',
    items: data?.items
      .map((item) => ({
        disposal_shipment_item_id: item.disposal_item_id,
        confirmed_qty: Number(item.confirmed_qty ?? 0),
        stocks:
          item.stock_members
            .map((stock) => ({
              disposal_shipment_stock_id: stock.id,
              received_qty: Number(stock.received_qty ?? 0),
            }))
            ?.filter((stock) => Number(stock.received_qty) > 0) ?? [],
      }))
      ?.filter((item) => item.stocks.length > 0),
  }

  return result
}
