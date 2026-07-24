import { useEffect } from 'react'
import { ProgramEnum } from '#constants/program'
import { MANUFACTURE_TYPE, USER_ROLE } from '#constants/roles'
import useSmileRouter from '#hooks/useSmileRouter'
import { getProgramStorage } from '#utils/storage/program'
import { getUserStorage } from '#utils/storage/user'

export const useDashboardRabiesEnabled = () => {
  const program = getProgramStorage()
  const { replace } = useSmileRouter()
  const user = getUserStorage()
  const isRabiesWorkspace = program?.key === ProgramEnum.Rabies

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

    if (!isRabiesWorkspace) {
      redirectPages()
    }
  }, [isRabiesWorkspace, replace, user])

  return {
    isRabiesWorkspace,
  }
}
