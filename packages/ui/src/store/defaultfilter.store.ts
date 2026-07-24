import { ActivityData } from '#types/activity'
import { create } from 'zustand'

interface State {
  routineActivity: ActivityData | null
  setRoutineActivity: (routine: ActivityData | null) => void
}

export const useDefaultFilterData = create<State>((set) => ({
  routineActivity: null,
  setRoutineActivity: (routineActivity) => set(() => ({ routineActivity })),
}))
