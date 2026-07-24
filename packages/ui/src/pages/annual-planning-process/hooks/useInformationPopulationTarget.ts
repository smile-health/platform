import { useMutation } from "@tanstack/react-query"
import { getCentralPopulation } from "../annual-planning-process.services"
import { useDataCentralPopulation } from "../store/central-pupulation.store"

type Params = {
  regencyId: number | string
  programPlanId: number | string
}
export const useInformationPopulationTarget = () => {
  const { setCentralPopulation, central_population } = useDataCentralPopulation()

  const {
    mutate: mutateCentralPopulation,
  } = useMutation({
    mutationKey: ['central-population'],
    mutationFn: (data: Params) => getCentralPopulation(data.programPlanId, data.regencyId),
    onSuccess: (data) => {
      if (data) setCentralPopulation(data)
    },
  })

  const resetCentralPopulation = () => {
    setCentralPopulation({
      approach: '',
      entity: { id: 0, name: '' },
      population_data: [],
      province: { id: 0, name: '' },
      year_plan: '',
    })
  }

  return {
    mutateCentralPopulation,
    central_population,
    resetCentralPopulation,
  }
}