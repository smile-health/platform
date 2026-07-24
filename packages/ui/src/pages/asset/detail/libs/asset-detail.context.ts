import { createContext } from 'react'

import { TAssetData } from '../../list/libs/asset-list.types'

type Props = {
  data: TAssetData | null
  childData: TAssetData[] | null
}
const AssetDetailContext = createContext<Props>({
  data: null,
  childData: null,
})

export default AssetDetailContext
