import { create } from "zustand"
import { DataCentralPopulation } from "../annual-planning-process.types"

type DataCentralPopulationState = {
  central_population: DataCentralPopulation
  setCentralPopulation: (data: DataCentralPopulation) => void
}

export const useDataCentralPopulation = create<DataCentralPopulationState>((set) => ({
  central_population: {
    approach: '',
    entity: { id: 0, name: '' },
    population_data: [],
    province: { id: 0, name: '' },
    year_plan: '',
  },
  setCentralPopulation: (data) => set(() => ({ central_population: data })),
}))
