import { MapName } from '#components/chart'
import { create } from 'zustand'

import {
  DashboardInventoryOverviewColor,
  DashboardInventoryType,
} from './dashboard-inventory-overview.constant'
import { TEntity, TMapItem } from './dashboard-inventory-overview.type'

type CommonState = {
  color?: DashboardInventoryOverviewColor
  isLoading?: boolean
}

export type MapState = CommonState & {
  type?: 'location' | 'entity'
  name?: MapName
  data: TMapItem[]
  color: DashboardInventoryOverviewColor
  source?: 'stock' | 'temperature' | 'activity'
  isLoading?: boolean
}

export type TransactionTypeState = DashboardInventoryType | null

export type EntityState = CommonState & {
  data: TEntity[]
}

type State = {
  enabled: boolean
  title: string
  status: string
  view: 'map' | 'list' | 'entities'
  lastUpdated?: string
  map: MapState
  transactionType: TransactionTypeState
  material_id: string | null
  setEnabled: (enabled: boolean) => void
  setTitle: (title: string) => void
  setStatus: (status: string) => void
  setLastUpdated: (date?: string) => void
  setView: (view: 'map' | 'list' | 'entities') => void
  setTransactionType: (transactionType: TransactionTypeState) => void
  setMap: (param: MapState) => void
  setMaterialId: (material_id: string | null) => void
}

export const useDashboardInventoryStore = create<State>((set) => ({
  enabled: false,
  title: '',
  status: 'Normal',
  lastUpdated: '',
  view: 'map',
  map: {
    name: 'indonesia',
    type: 'location',
    data: [],
    color: DashboardInventoryOverviewColor.Green,
    source: 'stock',
    isLoading: false,
  },
  transactionType: null,
  material_id: null,
  setEnabled: (enabled) => set(() => ({ enabled })),
  setTitle: (title) => set(() => ({ title })),
  setStatus: (status) =>
    set(() => ({ status: status.replace(/^[<>]\s*/, '') })),
  setLastUpdated: (lastUpdated) => set(() => ({ lastUpdated })),
  setView: (view) => set(() => ({ view })),
  setTransactionType: (transactionType) => set(() => ({ transactionType })),
  setMap: (map) => set(() => ({ map })),
  setMaterialId: (material_id) => set(() => ({ material_id })),
}))
