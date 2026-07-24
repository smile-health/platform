import dayjs from 'dayjs'

import { TFilterLoggerActivity } from './asset-detail.types'

export const processParamsLoggerActivity = ({
  params,
}: {
  params: TFilterLoggerActivity
}) => ({
  page: params?.page ?? null,
  paginate: params?.paginate ?? null,
  asset_id: params?.asset?.value,
  start_date: params?.date_range?.start
    ? dayjs(params?.date_range?.start).format('YYYY-MM-DD')
    : null,
  end_date: params?.date_range?.end
    ? dayjs(params?.date_range?.end).format('YYYY-MM-DD')
    : null,
})
