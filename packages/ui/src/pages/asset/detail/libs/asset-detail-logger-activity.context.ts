import { createContext } from 'react'

import { TFilterLoggerActivity } from './asset-detail.types'

type Props = {
  filter: TFilterLoggerActivity | null
  setFilter: (newFilter: TFilterLoggerActivity | null) => void
  shouldFetch: boolean
  setShouldFetch: (shouldFetch: boolean) => void
}

const AssetDetailLoggerActivityContext = createContext<Props>({
  filter: null,
  setFilter: () => {},
  shouldFetch: false,
  setShouldFetch: () => {},
})

export default AssetDetailLoggerActivityContext
