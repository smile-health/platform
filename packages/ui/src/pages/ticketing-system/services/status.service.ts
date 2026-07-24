import { OptionType } from '#components/react-select'
import axios from '#lib/axios'

import { Status } from '../ticketing-system.type'

type GetStatusListResponse = Status[]

export async function getStatusList(): Promise<GetStatusListResponse> {
  const response = await axios.get('/main/event-report/status')
  return response?.data
}

export async function loadStatusOptions() {
  const result: OptionType[] = []
  const response = await getStatusList()

  if (response.length) {
    response.forEach((item) => {
      if (item?.title !== null) {
        result.push({
          label: item?.title,
          value: item?.id,
        })
      }
    })
  }

  return result
}
