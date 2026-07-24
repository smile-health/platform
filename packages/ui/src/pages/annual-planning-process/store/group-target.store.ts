import { create } from "zustand"
import { ListGroupTargetResponse } from "../annual-planning-process.types"

type DataGroupTargetState = {
  group_target: ListGroupTargetResponse['data']
  setGroupTarget: (data: ListGroupTargetResponse['data']) => void
}

export const useDataGroupTarget = create<DataGroupTargetState>((set) => ({
  group_target: [],
  setGroupTarget: (data) => set(() => ({ group_target: data })),
}))
