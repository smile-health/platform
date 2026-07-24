import { createContext } from 'react'
import { TDetailEntity } from '#types/entity'

const EntityDetailToEditContext = createContext({
  setIsEdit: (_: boolean) => {},
  isEdit: false,
  entity: null as TDetailEntity | null,
})

export default EntityDetailToEditContext
