import { SERVICE_API } from '#constants/api'
import axios from '#lib/axios'
import {
  createOrderRelocationBody as createOrderRelocationPayload
} from './order-create-relocation.types'

const { MAIN } = SERVICE_API

export async function createOrderRelocation(
  data: createOrderRelocationPayload
): Promise<{ createdOrderId: number }> {
  const response = await axios.post(`${MAIN}/orders/relocation`, data, {
    cleanParams: true,
  })
  return response?.data
}