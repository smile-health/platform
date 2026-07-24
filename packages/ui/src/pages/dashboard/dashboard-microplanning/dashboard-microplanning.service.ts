import axios from '#lib/axios'
import { TCommonMicroplanningParams, TRegionType  } from '../dashboard.type'
import { parseDownload } from '#utils/download'

export async function getDataTargetConsumptionVaccination(
    params: TCommonMicroplanningParams,
    type: TRegionType 
) {
    const response = await axios.get(
        `/main/microplanning/dashboard/target-consumption/${type}/material`, {
        params
    }
    )
    return response?.data
}

export async function getTotalTargetData(
    params: TCommonMicroplanningParams,
    type: TRegionType 
) {
    const response = await axios.get(
        `/main/microplanning/dashboard/total-target/${type}`, {
        params
    }
    )
    return response?.data
}

export async function exportMicroplanning(
    params: TCommonMicroplanningParams,
    type: TRegionType 
) {
    const response = await axios.get(`/main/microplanning/dashboard/target-consumption/${type}/material/xls`, {
        responseType: 'blob',
        params
    })

    parseDownload(response?.data, response?.headers?.filename)

    return response?.data
}