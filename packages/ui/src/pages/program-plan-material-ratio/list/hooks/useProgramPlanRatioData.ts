import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import useSmileRouter from '#hooks/useSmileRouter'
import { getReactSelectValue } from '#utils/react-select'
import { useTranslation } from 'react-i18next'

import {
  ProgramPlanMaterialRatioItem,
  ProgramPlanMaterialRatioResponse,
} from '../../../program-plan/list/libs/program-plan-list.type'
import { getProgramPlanMaterialRatios } from '../../services/program-plan-material-ratio.services'

type Filter = { page: number; paginate: number; materialId?: OptionType[] }

export const useProgramPlanRatioData = (filter: Filter) => {
  const router = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation(['common', 'programPlan'])

  const { id } = router.query as { id?: string }
  const query = useQuery({
    queryKey: ['program-plan-material-ratio', id, language, filter],
    queryFn: async () =>
      getProgramPlanMaterialRatios(Number(id), {
        page: filter.page,
        paginate: filter.paginate,
        material_id: getReactSelectValue(filter.materialId),
      }),
  })

  const apiData = query.data as ProgramPlanMaterialRatioResponse | undefined

  const rows = useMemo(() => {
    return (
      apiData?.data.map((item: ProgramPlanMaterialRatioItem, index: number) => {
        const locale = language === 'id' ? 'id-ID' : 'en-US'
        const leftQty = Number(item.from_material_qty).toLocaleString(locale)
        const rightQty = Number(item.to_material_qty).toLocaleString(locale)

        return {
          id: item.id,
          no: index + 1,
          material_left_name: item.from_material?.name ?? '-',
          material_left_type: item.from_subtype?.name ?? '-',
          material_right_name: item.to_material?.name ?? '-',
          material_right_type: item.to_subtype?.name ?? '-',
          ratio: `${leftQty} : ${rightQty}`,
          updated_by: item.user_updated_by.fullname ?? '-',
          updated_at: item.user_updated_at,
        }
      }) ?? []
    )
  }, [apiData, language])

  return {
    rows,
    pagination: {
      page: apiData?.page ?? filter.page,
      itemPerPage: apiData?.item_per_page ?? filter.paginate,
      totalItem: apiData?.total_item ?? rows.length,
      totalPage:
        apiData?.total_page ??
        Math.max(
          1,
          Math.ceil(
            (apiData?.total_item ?? rows.length) /
              Math.max(1, apiData?.item_per_page ?? filter.paginate)
          )
        ),
      listPagination: apiData?.list_pagination ?? [10, 25, 50, 100],
    },
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
