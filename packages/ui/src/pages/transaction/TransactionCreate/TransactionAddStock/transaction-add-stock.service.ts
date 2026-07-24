import { OptionType } from '#components/react-select'
import { SERVICE_API } from '#constants/api'
import { STATUS } from '#constants/common'
import axios from '#lib/axios'
import {
  ListManufacturersParams,
  ListManufacturersResponse,
} from '#services/manufacturer'
import { TManufacturer } from '#types/manufacturer'
import { handleAxiosResponse } from '#utils/api'

import {
  DetailBudgetSourceResponse,
  ListBudgetSourceResponse,
} from '../../../budget-source/budget-source.type'
import {
  CreateTransactionAddStockBody,
  ListTransactionReasonParams,
  ListTransactionReasonResponse,
  ListTransactionStatusVVMParams,
  ListTransactionStatusVVMResponse,
  TransactionReason,
  TransactionStatusVVM,
} from './transaction-add-stock.type'
import { processPayload } from './utils/helpers'

const MAIN_SERVICE = SERVICE_API.MAIN
export async function loadTransactionReason(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    transaction_type_id: string | number | null
  }
) {
  let params: ListTransactionReasonParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    transaction_type_id: additional.transaction_type_id,
    status: 1,
  }

  const fetchTransactionTypeList = await axios.get(
    `${MAIN_SERVICE}/transactions/reason`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListTransactionReasonResponse>(
    fetchTransactionTypeList
  )

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item: TransactionReason) => ({
    label: item?.title,
    value: {
      id: item.id,
      is_purchase: item.is_purchase,
      is_other: item.is_other,
    },
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadStatusVVM(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    another_option?: (options: Array<OptionType>) => Array<OptionType>
  }
) {
  let params: ListTransactionStatusVVMParams = {
    page: additional.page,
    paginate: 10,
    keyword,
  }

  const fetchTransactionStatusVVM = await axios.get(
    `${MAIN_SERVICE}/stock-qualities`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListTransactionStatusVVMResponse>(
    fetchTransactionStatusVVM
  )

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        page: additional.page + 1,
      },
    }
  }

  let options = result?.data?.map((item: TransactionStatusVVM) => ({
    label: item.label,
    value: item.id,
  }))

  if (
    additional.another_option &&
    typeof additional.another_option === 'function' &&
    result?.data?.length <= 0
  ) {
    options = additional.another_option(options)
  }

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      page: additional.page + 1,
    },
  }
}

export async function loadBudgetSource(
  keyword: string,
  _: unknown,
  additional: {
    page: number
    another_option?: OptionType[]
    isGlobal?: boolean
    restricted?: string
    isHideRestricted?: boolean
    isSelectableRestricted?: boolean
  }
) {
  const apiUrl = `${additional?.isGlobal ? SERVICE_API.CORE : SERVICE_API.MAIN}/budget-sources`
  const response = await axios.get(apiUrl, {
    params: {
      page: additional.page,
      paginate: 10,
      status: STATUS.ACTIVE,
      keyword,
    },
    cleanParams: true,
  })
  const result = handleAxiosResponse<ListBudgetSourceResponse>(response)

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  let options = result?.data?.map((item: DetailBudgetSourceResponse) => {
    const isRestricted =
      !additional.isSelectableRestricted && item.is_restricted === 1
    const restrictedSuffix = isRestricted
      ? ' (' + additional.restricted + ')'
      : ''

    return {
      label: item.name + restrictedSuffix,
      value: item.id,
      isDisabled: isRestricted,
    }
  })

  return {
    options:
      additional.another_option && additional.page === 1
        ? [...additional.another_option, ...options]
        : options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadManufacturer(
  keyword: string,
  _: unknown,
  additional: {
    material_id: number
    page: number
  }
) {
  let params: ListManufacturersParams = {
    page: additional.page,
    paginate: 10,
    keyword,
    status: STATUS.ACTIVE,
    material_id: additional.material_id,
  }

  const fetchTransactionManufacturer = await axios.get(
    `${MAIN_SERVICE}/manufactures`,
    {
      params,
      cleanParams: true,
    }
  )

  const result = handleAxiosResponse<ListManufacturersResponse>(
    fetchTransactionManufacturer
  )

  if (result?.statusCode === 204) {
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional.page + 1,
      },
    }
  }

  const options = result?.data?.map((item: TManufacturer) => ({
    label: item.name,
    value: item.id,
  }))

  return {
    options,
    hasMore: result?.data?.length > 0,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function createAddStock(rawData: CreateTransactionAddStockBody) {
  const data = processPayload({ data: rawData })
  const response = await axios.post(
    `${MAIN_SERVICE}/transactions/add-stock`,
    data
  )

  return response?.data
}
