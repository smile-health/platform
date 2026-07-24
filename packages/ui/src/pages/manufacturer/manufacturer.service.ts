import axios from '#lib/axios'
import { ListManufacturersParams } from '#services/manufacturer'
import { TManufacturer } from '#types/manufacturer'
import { parseDownload } from '#utils/download'

export type ManufacturerBody = {
  name?: string
  type?: number
  reference_id?: string
  description?: string
  contact_name?: string
  phone_number?: string
  email?: string
  address?: string
}

export type ManufacturerTypes = {
  id: number
  name: string
}

export type ListManufacturerTypeResponse = ManufacturerTypes[]

export type DetailManufacturerResponse = TManufacturer

export async function detailManufacturer(
  id: number | string
): Promise<DetailManufacturerResponse> {
  const response = await axios.get(`/core/manufactures/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function detailPlatformManufacturer(
  id: number | string
): Promise<DetailManufacturerResponse> {
  const response = await axios.get(`/main/manufactures/${id}`, {
    redirect: true,
  })
  return response?.data
}

export async function createManufacturer(data: ManufacturerBody) {
  const response = await axios.post('/core/manufactures', data)
  return response?.data
}

export async function updateManufacturer(id: number, body: ManufacturerBody) {
  const data = { ...body }
  const response = await axios.put(`/core/manufactures/${id}`, data)

  return response?.data
}

export async function exportManufacturer(params: ListManufacturersParams) {
  const response = await axios.get('/core/manufactures/xls', {
    responseType: 'blob',
    params,
  })

  parseDownload(response?.data, response?.headers?.filename)

  return response?.data
}

export async function downloadTemplateManufacturer() {
  const response = await axios.get('/core/manufactures/xls-template', {
    responseType: 'blob',
  })
  parseDownload(response?.data, 'template_manufacture.xlsx')

  return response?.data
}

export async function importManufacturer(input: FormData) {
  const response = await axios.post('/core/manufactures/xls', input)
  return response?.data
}

export async function updateStatusManufacturer(id: string, status: number) {
  const response = await axios.put(`/core/manufactures/${id}`, {
    status,
  })
  return response?.data
}

export async function updateStatusManufacturerInProgram(
  id: string,
  status: number
) {
  const response = await axios.put(`/main/manufactures/${id}/status`, {
    status,
  })
  return response?.data
}

export async function listManufacturerType(): Promise<ListManufacturerTypeResponse> {
  const response = await axios.get('/core/manufactures/type')
  return response?.data
}
