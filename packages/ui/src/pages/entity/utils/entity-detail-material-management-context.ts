import { createContext } from 'react'
import { TDetailEntity } from '#types/entity'
import { ParamsMaterialEntity } from '#services/entity'

type TEntityDetailMaterialManagementContext = {
  entity?: TDetailEntity | null
  params?: ParamsMaterialEntity | null
  keyword?: string | null
}

const EntityDetailMaterialManagementContext =
  createContext<TEntityDetailMaterialManagementContext>({
    entity: null,
    params: null,
    keyword: null,
  })

export default EntityDetailMaterialManagementContext
