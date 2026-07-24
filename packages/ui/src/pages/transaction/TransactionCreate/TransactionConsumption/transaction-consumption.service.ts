import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import { cleanObjectValuesOfConsumption } from './utils/helpers'
import { 
  CreateTransactionConsumptionBody, 
  ListVaccineSequenceByProtocolResponse, 
  ResponseDataPatientLocation, 
  ResponseDataPatientNIK, 
  ResponseMasterDataPatient,
  ResponsePatienVaccineSequence 
} from './transaction-consumption.type'
import { AxiosResponse } from 'axios'

const MAIN_SERVICE = SERVICE_API.MAIN
const CORE_SERVICE = SERVICE_API.CORE

export async function createConsumption(
  data: CreateTransactionConsumptionBody
) {
  const response = await axios.post(
    `${MAIN_SERVICE}/transactions/consumption`,
    cleanObjectValuesOfConsumption(data), {
    cleanBody: true,
    cleanParams: true,
  }
  )

  return response?.data
}

export async function createConsumptionV2(
  data: CreateTransactionConsumptionBody
) {
  const response = await axios.post(
    `${MAIN_SERVICE}/v2/transactions/consumption`,
    cleanObjectValuesOfConsumption(data), {
    cleanBody: true,
    cleanParams: true,
  }
  )

  return response?.data
}

export async function getListRabiesSequence() {
  const response = await axios.get(`${MAIN_SERVICE}/transactions/rabies-sequence`)

  return response?.data
}

export async function getListVaccineSequenceByProtocol(protocolId: string | number, nik?: string) {
  const response: AxiosResponse<ListVaccineSequenceByProtocolResponse> = await axios.get(`${MAIN_SERVICE}/v2/protocols/${protocolId}/vaccine-sequences`, {
    params: {
      nik,
    }
  })

  return response?.data
}

export async function getDataPatientNIK(nik: string) {
  const response: AxiosResponse<ResponseDataPatientNIK> = await axios.get(`${MAIN_SERVICE}/consumptions/patient/${nik}`)

  return response?.data
}

export async function getDataPatientLocation(nik: string) {
  const response: AxiosResponse<ResponseDataPatientLocation> = await axios.get(`${MAIN_SERVICE}/consumptions/patient/${nik}/location`)

  return response?.data
}

export async function getDataPatientSequence(nik: string, protocolId: string | number) {
  const response: AxiosResponse<ResponsePatienVaccineSequence> = await axios.get(`${MAIN_SERVICE}/consumptions/patient/${nik}/${protocolId}/vaccine-sequence`)

  return response?.data
}

export async function loadListEducation(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/educations`, {
    params: {
      keyword,
      paginate: 10,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadListOccupation(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/occupations`, {
    params: {
      keyword,
      paginate: 50,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadListReligion(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/religions`, {
    params: {
      keyword,
      paginate: 10,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadListEthnic(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/ethnics`, {
    params: {
      keyword,
      paginate: 50,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadListReaction(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/reactions`, {
    params: {
      keyword,
      paginate: 10,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadListGender(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/genders`, {
    params: {
      keyword,
      paginate: 10,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}

export async function loadListMaritalStatus(
  keyword: string,
  _: unknown,
  additional: {
    page: number
  }
) {
  const result: AxiosResponse<ResponseMasterDataPatient> = await axios.get(`${CORE_SERVICE}/marital-status`, {
    params: {
      keyword,
      paginate: 25,
      ...additional,
    }
  })

  if (result.status === 204)
    return {
      options: [],
      hasMore: false,
      additional: {
        ...additional,
        page: additional?.page + 1,
      },
    }

  const options = result?.data?.data?.map((item) => ({
    label: item?.title,
    value: item?.id,
  }))

  return {
    options,
    hasMore: result?.data?.total_item > additional.page * result?.data?.item_per_page,
    additional: {
      ...additional,
      page: additional.page + 1,
    },
  }
}
