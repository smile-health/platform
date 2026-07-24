import { createContext } from 'react'

import { TAssetInventory } from '../../list/libs/asset-inventory-list.types'

type Props = {
  data: TAssetInventory | null
}
const AssetInventoryDetailContext = createContext<Props>({
  data: null,
})

export default AssetInventoryDetailContext
