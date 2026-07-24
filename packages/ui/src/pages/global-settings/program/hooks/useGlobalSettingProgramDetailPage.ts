import { useTranslation } from "react-i18next"
import { useRouter } from "next/router"
import { parseAsString, useQueryStates } from "nuqs"
import { useQuery } from "@tanstack/react-query"

import { detailPrograms } from "../services/program"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"

export const useGlobalSettingProgramDetailPage = () => {
  const { t } = useTranslation(['common', 'programGlobalSettings'])
  const router = useRouter()
  const { id } = router.query

  const [query, setQuery] = useQueryStates({
    tab: parseAsString.withDefault('detail')
  }, { history: 'push' })

  const { data, isFetching } = useQuery({
    queryKey: ['detail-programs'],
    queryFn: () => detailPrograms(id as string),
    refetchOnWindowFocus: false,
    enabled: !!id,
  })

  useSetLoadingPopupStore(isFetching)

  return {
    t,
    query,
    setQuery,
    data,
  }
}