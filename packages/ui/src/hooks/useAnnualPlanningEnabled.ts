import { useEffect } from 'react'
import { MANUFACTURE_TYPE, USER_ROLE } from '#constants/roles'
import useSmileRouter from '#hooks/useSmileRouter'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'

export const useAnnualPlanningEnabled = (isGlobal?: boolean) => {
  const program = getProgramStorage()
  const { replace } = useSmileRouter()
  const user = getUserStorage()
  const isEnabledAnnual = program?.config?.is_annual_planning

  useEffect(() => {
    const redirectPages = () => {
      if (
        user?.role === USER_ROLE.MANUFACTURE &&
        user?.manufacture?.type === MANUFACTURE_TYPE.MATERIAL
      ) {
        return replace('/v5/order')
      }

      return replace('/v5/dashboard/transaction-monitoring')
    }

    if (!isEnabledAnnual && !isGlobal) {
      redirectPages()
    }
  }, [isEnabledAnnual, isGlobal, replace, user])

  return {
    isDisabledAnnual: !isEnabledAnnual && !isGlobal,
  }
}
