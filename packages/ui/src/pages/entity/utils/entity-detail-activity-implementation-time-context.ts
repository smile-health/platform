import { createContext } from 'react'
import { TDetailEntity } from '#types/entity'

type TEntityDetailActivityImplementationTimeContext = {
  entity: TDetailEntity | null
}

const EntityDetailActivityImplementationTimeContext =
  createContext<TEntityDetailActivityImplementationTimeContext>({
    entity: null,
  })

export default EntityDetailActivityImplementationTimeContext
