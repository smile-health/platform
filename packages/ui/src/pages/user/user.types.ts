import { OptionType } from '#components/react-select'

import { generateUserDetail } from './user.helper'

export type FormFilterUserType = {
  keyword: string
  role: string
  status: string
  start_date: string
  end_date: string
  primary_vendor?: OptionType
  province: OptionType[]
  regency: OptionType[]
  primary_health_care?: OptionType
}

export type TDetailUserData = ReturnType<typeof generateUserDetail>
