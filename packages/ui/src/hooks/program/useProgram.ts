import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ProgramEnum, ProgramWasteManagement } from '#constants/program'
import { MANUFACTURE_TYPE, USER_ROLE } from '#constants/roles'
import useSmileRouter from '#hooks/useSmileRouter'
import { listPrograms } from '#services/program'
import { getAuthTokenCookies } from '#utils/storage/auth'
import { getProgramStorage, removeProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'
import { generateInitials } from '#utils/strings'
import { isUserWMS } from '#utils/user'
import { parseAsString, useQueryStates } from 'nuqs'
import { useTranslation } from 'react-i18next'

import { useDebounce } from '../useDebounce'

type Props = {
  isCore?: boolean
  onlyBaseParams?: boolean
  isEnabled?: boolean
  isIncludeWasteManagement?: boolean
  isWms?:boolean
}

export const useProgram = ({
  isCore,
  onlyBaseParams,
  isEnabled = true,
  isIncludeWasteManagement,
  isWms =false,
}: Props = {}) => {
  const { pathname } = useSmileRouter()
  const {
    i18n: { language },
  } = useTranslation()
  const user = getUserStorage()
  const token = getAuthTokenCookies()

  const [keyword, setKeyword] = useState('')
  const [isHierarchyEnabled, setIsHierarchyEnabled] = useState('')
  const [localSearch, setLocalSearch] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
    },
    { history: 'push' }
  )

  const debounceKeyword = useDebounce(keyword, 500)
  const debounceLocalSearch = useDebounce(localSearch.search, 500)

  const coreProgram = useQuery({
    queryKey: !onlyBaseParams
      ? ['listPrograms', debounceKeyword, isHierarchyEnabled]
      : ['listPrograms', debounceKeyword],
    queryFn: () =>
      listPrograms({
        page: 1,
        paginate: 10,
        keyword: debounceKeyword,
        ...(!onlyBaseParams && {
          is_material_hierarchy_enabled: Number(isHierarchyEnabled),
        }),
      }),
    enabled: !!isCore && !!isEnabled,
  })

  function setUrl(url: string, key: string) {
    const newUrl = url?.startsWith('/') ? url : `/${url}`

    const result = `${isWms? process.env.NEXT_PUBLIC_URL_FE_SMILE : ''}/${language}/${key}${newUrl}`

    return result
  }

  const getHref = (key?: string) => {
    if (!key) return ''
    // const user = getUserStorage()
    if (pathname === '/[lang]/v5/program') {
      if (
        user?.role === USER_ROLE.MANUFACTURE &&
        (user?.manufacture?.type === 1 ||
          user?.manufacture?.type === MANUFACTURE_TYPE.VAKSIN)
      ) {
        return setUrl('/v5/order', key)
      }
      if (key === ProgramEnum.Immunization) {
        return setUrl('/v5/dashboard/inventory-overview', key)
      }

      return setUrl('/v5/dashboard/transaction-monitoring', key)
    } else {
      if (
        user?.role === USER_ROLE.MANUFACTURE &&
        user?.manufacture?.type === 1
      ) {
        return setUrl('/v5/order', key)
      }
      return key === ProgramEnum.Immunization
        ? setUrl('/v5/dashboard/inventory-overview', key)
        : setUrl('/v5/dashboard/transaction-monitoring', key)
    }
  }

  const userPrograms = user?.programs?.filter((p) => Boolean(p?.status))

  if (
    pathname?.split('/')[2] !== '[program]' &&
    pathname?.split('/')?.[3] !== 'export-history'
  )
    removeProgramStorage()

  const filteredPrograms = useMemo(() => {
    let temp = userPrograms

    if (token) {
      if (isUserWMS(user)) {
        temp = [ProgramWasteManagement(language), ...(temp ?? [])]
      } else if (isIncludeWasteManagement) {
        temp = userPrograms?.concat(ProgramWasteManagement(language))
      }
    }

    if (!debounceLocalSearch) {
      return temp
    }
    return temp?.filter(
      (program: any) =>
        program.name
          .toLowerCase()
          .includes(debounceLocalSearch.toLowerCase()) ||
        generateInitials(program.name)
          .toLowerCase()
          .includes(debounceLocalSearch.toLowerCase())
    )
  }, [user, token, debounceLocalSearch, language])

  return {
    data: isCore ? coreProgram.data?.data : filteredPrograms,
    isLoading: isCore ? coreProgram.isFetching : false,
    isSuccess: isCore ? coreProgram.isSuccess : true,
    activeProgram: getProgramStorage(),
    keyword: debounceKeyword,
    coreProgram,
    setIsHierarchyEnabled,
    setKeyword,
    getHref,
    localSearch,
    setLocalSearch,
  }
}
